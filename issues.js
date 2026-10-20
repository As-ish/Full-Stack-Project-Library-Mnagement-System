const router = require("express").Router();
const db = require("../db");
const { HttpError, nextId, iso, addDays, daysBetween } = require("../utils");

const LOAN_DAYS = Number(process.env.LOAN_DAYS) || 14;

const BASE = `
  SELECT i.id, i.book_id AS bookId, i.member_id AS memberId,
         i.issue_date AS issueDate, i.due_date AS dueDate, i.return_date AS returnDate,
         b.title AS bookTitle, b.author AS bookAuthor, m.name AS memberName
  FROM issues i
  JOIN books b ON b.id = i.book_id
  JOIN members m ON m.id = i.member_id`;

function decorate(r) {
  const today = iso();
  const daysOverdue = !r.returnDate ? Math.max(0, daysBetween(r.dueDate, today)) : 0;
  return { ...r, overdue: daysOverdue > 0, daysOverdue };
}

// GET /api/issues?status=active|returned|overdue|all   (default: active)
router.get("/", (req, res) => {
  const status = req.query.status || "active";
  let rows = db.prepare(`${BASE} ORDER BY i.issue_date DESC, i.id DESC`).all().map(decorate);
  if (status === "active") rows = rows.filter((r) => !r.returnDate);
  else if (status === "returned") rows = rows.filter((r) => r.returnDate);
  else if (status === "overdue") rows = rows.filter((r) => r.overdue);
  if (req.query.memberId) rows = rows.filter((r) => r.memberId === req.query.memberId);
  if (req.query.bookId) rows = rows.filter((r) => r.bookId === req.query.bookId);
  res.json(rows);
});

// POST /api/issues   { bookId, memberId }
router.post("/", (req, res) => {
  const { bookId, memberId } = req.body;
  if (!bookId || !memberId) throw new HttpError(400, "bookId and memberId are required");

  const result = db.transaction(() => {
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId);
    if (!book) throw new HttpError(404, "Book not found");
    const member = db.prepare("SELECT id FROM members WHERE id = ?").get(memberId);
    if (!member) throw new HttpError(404, "Member not found");
    if (book.available < 1) throw new HttpError(409, "No copies available to issue");

    const dup = db
      .prepare("SELECT 1 FROM issues WHERE book_id=? AND member_id=? AND return_date IS NULL")
      .get(bookId, memberId);
    if (dup) throw new HttpError(409, "This member already has this book on loan");

    const id = nextId(db, "issues", "R", 1001);
    const today = new Date();
    db.prepare("INSERT INTO issues (id,book_id,member_id,issue_date,due_date,return_date) VALUES (?,?,?,?,?,NULL)")
      .run(id, bookId, memberId, iso(today), iso(addDays(today, LOAN_DAYS)));
    db.prepare("UPDATE books SET available = available - 1 WHERE id = ?").run(bookId);
    return id;
  })();

  res.status(201).json(decorate(db.prepare(`${BASE} WHERE i.id = ?`).get(result)));
});

// POST /api/issues/:id/return
router.post("/:id/return", (req, res) => {
  db.transaction(() => {
    const r = db.prepare("SELECT * FROM issues WHERE id = ?").get(req.params.id);
    if (!r) throw new HttpError(404, "Loan record not found");
    if (r.return_date) throw new HttpError(409, "This book has already been returned");
    db.prepare("UPDATE issues SET return_date = ? WHERE id = ?").run(iso(), r.id);
    db.prepare("UPDATE books SET available = available + 1 WHERE id = ?").run(r.book_id);
  })();
  res.json(decorate(db.prepare(`${BASE} WHERE i.id = ?`).get(req.params.id)));
});

module.exports = router;
