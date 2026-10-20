const router = require("express").Router();
const db = require("../db");
const { HttpError, nextId, GENRES } = require("../utils");

const activeLoans = (id) =>
  db.prepare("SELECT COUNT(*) c FROM issues WHERE book_id = ? AND return_date IS NULL").get(id).c;

// GET /api/books?q=&genre=
router.get("/", (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  const genre = req.query.genre;
  let rows = db.prepare("SELECT * FROM books ORDER BY CAST(SUBSTR(id,3) AS INTEGER)").all();
  if (q) {
    rows = rows.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.isbn || "").includes(q)
    );
  }
  if (genre && genre !== "All") rows = rows.filter((b) => b.genre === genre);
  res.json(rows);
});

router.get("/genres", (_req, res) => res.json(GENRES));

router.get("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) throw new HttpError(404, "Book not found");
  res.json(book);
});

function validate(body, partial = false) {
  const { title, author, genre, isbn, copies } = body;
  if (!partial || title !== undefined) if (!title || !String(title).trim()) throw new HttpError(400, "Title is required");
  if (!partial || author !== undefined) if (!author || !String(author).trim()) throw new HttpError(400, "Author is required");
  if (genre !== undefined && !GENRES.includes(genre)) throw new HttpError(400, `Genre must be one of: ${GENRES.join(", ")}`);
  if (copies !== undefined && (!Number.isInteger(Number(copies)) || Number(copies) < 1))
    throw new HttpError(400, "Copies must be a whole number of at least 1");
}

// POST /api/books
router.post("/", (req, res) => {
  validate(req.body);
  const { title, author, genre = GENRES[0], isbn = "", copies = 1 } = req.body;
  const n = Number(copies);
  const id = nextId(db, "books", "B", 101);
  try {
    db.prepare("INSERT INTO books (id,title,author,genre,isbn,copies,available) VALUES (?,?,?,?,?,?,?)")
      .run(id, title.trim(), author.trim(), genre, isbn.trim() || null, n, n);
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) throw new HttpError(409, "A book with this ISBN already exists");
    throw e;
  }
  res.status(201).json(db.prepare("SELECT * FROM books WHERE id = ?").get(id));
});

// PUT /api/books/:id
router.put("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) throw new HttpError(404, "Book not found");
  validate(req.body, true);

  const next = {
    title: (req.body.title ?? book.title).trim(),
    author: (req.body.author ?? book.author).trim(),
    genre: req.body.genre ?? book.genre,
    isbn: req.body.isbn !== undefined ? (req.body.isbn.trim() || null) : book.isbn,
    copies: req.body.copies !== undefined ? Number(req.body.copies) : book.copies,
  };

  const onLoan = activeLoans(book.id);
  if (next.copies < onLoan)
    throw new HttpError(409, `Cannot reduce copies below ${onLoan} — that many are currently on loan`);

  try {
    db.prepare("UPDATE books SET title=?, author=?, genre=?, isbn=?, copies=?, available=? WHERE id=?")
      .run(next.title, next.author, next.genre, next.isbn, next.copies, next.copies - onLoan, book.id);
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) throw new HttpError(409, "A book with this ISBN already exists");
    throw e;
  }
  res.json(db.prepare("SELECT * FROM books WHERE id = ?").get(book.id));
});

// DELETE /api/books/:id
router.delete("/:id", (req, res) => {
  const book = db.prepare("SELECT id FROM books WHERE id = ?").get(req.params.id);
  if (!book) throw new HttpError(404, "Book not found");
  if (activeLoans(book.id) > 0) throw new HttpError(409, "Can't remove — a copy is still on loan");
  db.transaction(() => {
    db.prepare("DELETE FROM issues WHERE book_id = ?").run(book.id); // history of returned loans
    db.prepare("DELETE FROM books WHERE id = ?").run(book.id);
  })();
  res.json({ message: "Title removed from catalogue" });
});

module.exports = router;
