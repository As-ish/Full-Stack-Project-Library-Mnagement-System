const router = require("express").Router();
const db = require("../db");
const { iso, daysBetween } = require("../utils");

// GET /api/dashboard  -> everything the "Front Desk" screen needs in one call
router.get("/", (_req, res) => {
  const t = db.prepare("SELECT COUNT(*) titles, COALESCE(SUM(copies),0) totalCopies, COALESCE(SUM(available),0) availableCopies FROM books").get();
  const members = db.prepare("SELECT COUNT(*) c FROM members").get().c;

  const active = db.prepare(`
    SELECT i.id, i.book_id AS bookId, i.member_id AS memberId, i.issue_date AS issueDate, i.due_date AS dueDate,
           b.title AS bookTitle, m.name AS memberName
    FROM issues i JOIN books b ON b.id=i.book_id JOIN members m ON m.id=i.member_id
    WHERE i.return_date IS NULL ORDER BY i.issue_date DESC, i.id DESC`).all();

  const today = iso();
  const withFlags = active.map((r) => ({ ...r, overdue: daysBetween(r.dueDate, today) > 0 }));

  const genres = db.prepare("SELECT genre, COUNT(*) count FROM books GROUP BY genre ORDER BY count DESC, genre").all();

  res.json({
    stats: {
      titles: t.titles,
      totalCopies: t.totalCopies,
      availableCopies: t.availableCopies,
      issuedCopies: t.totalCopies - t.availableCopies,
      members,
      overdue: withFlags.filter((r) => r.overdue).length,
    },
    recentLoans: withFlags.slice(0, 6),
    genres,
  });
});

module.exports = router;
