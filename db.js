require("dotenv").config();
const path = require("path");
const Database = require("better-sqlite3");

const file = path.resolve(process.env.DB_FILE || "./library.db");
const db = new Database(file);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id        TEXT PRIMARY KEY,
    title     TEXT NOT NULL,
    author    TEXT NOT NULL,
    genre     TEXT NOT NULL,
    isbn      TEXT UNIQUE,
    copies    INTEGER NOT NULL DEFAULT 1 CHECK (copies >= 1),
    available INTEGER NOT NULL DEFAULT 1 CHECK (available >= 0)
  );

  CREATE TABLE IF NOT EXISTS members (
    id     TEXT PRIMARY KEY,
    name   TEXT NOT NULL,
    email  TEXT NOT NULL UNIQUE,
    phone  TEXT DEFAULT '',
    joined TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS issues (
    id          TEXT PRIMARY KEY,
    book_id     TEXT NOT NULL REFERENCES books(id),
    member_id   TEXT NOT NULL REFERENCES members(id),
    issue_date  TEXT NOT NULL,
    due_date    TEXT NOT NULL,
    return_date TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_issues_book   ON issues(book_id);
  CREATE INDEX IF NOT EXISTS idx_issues_member ON issues(member_id);
  CREATE INDEX IF NOT EXISTS idx_issues_active ON issues(return_date);
`);

module.exports = db;
