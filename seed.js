const db = require("./db");
const { iso, addDays } = require("./utils");

function seed({ reset = false } = {}) {
  if (reset) {
    db.exec("DELETE FROM issues; DELETE FROM members; DELETE FROM books;");
  } else if (db.prepare("SELECT COUNT(*) c FROM books").get().c > 0) {
    return false; // already has data
  }

  const books = [
    ["B-101", "The Midnight Library", "Matt Haig", "Fiction", "978-0525559474", 3, 1],
    ["B-102", "Sapiens", "Yuval Noah Harari", "History", "978-0062316097", 2, 0],
    ["B-103", "Atomic Habits", "James Clear", "Self-Help", "978-0735211292", 4, 3],
    ["B-104", "Dune", "Frank Herbert", "Sci-Fi", "978-0441172719", 2, 1],
    ["B-105", "The Silent Patient", "Alex Michaelides", "Thriller", "978-1250301697", 3, 3],
    ["B-106", "Educated", "Tara Westover", "Memoir", "978-0399590504", 2, 1],
    ["B-107", "A Brief History of Time", "Stephen Hawking", "Science", "978-0553380163", 2, 2],
    ["B-108", "The Alchemist", "Paulo Coelho", "Fiction", "978-0062315007", 5, 4],
  ];

  const members = [
    ["M-01", "Ananya Sharma", "ananya.sharma@mail.com", "98765 43210", "2024-02-11"],
    ["M-02", "Rohit Verma", "rohit.verma@mail.com", "91234 56780", "2024-06-20"],
    ["M-03", "Kabir Malhotra", "kabir.m@mail.com", "99887 66554", "2023-11-02"],
    ["M-04", "Sneha Iyer", "sneha.iyer@mail.com", "90011 22334", "2025-01-15"],
  ];

  const t = new Date();
  const d = (n) => iso(addDays(t, n));
  const issues = [
    ["R-1001", "B-102", "M-01", d(-20), d(-6), null],
    ["R-1002", "B-102", "M-03", d(-12), d(2), null],
    ["R-1003", "B-101", "M-02", d(-5), d(9), null],
    ["R-1004", "B-104", "M-04", d(-3), d(11), null],
    ["R-1005", "B-106", "M-01", d(-30), d(-16), d(-18)],
    ["R-1006", "B-108", "M-03", d(-2), d(12), null],
  ];

  const tx = db.transaction(() => {
    const ib = db.prepare("INSERT INTO books VALUES (?,?,?,?,?,?,?)");
    const im = db.prepare("INSERT INTO members VALUES (?,?,?,?,?)");
    const ii = db.prepare("INSERT INTO issues VALUES (?,?,?,?,?,?)");
    books.forEach((r) => ib.run(...r));
    members.forEach((r) => im.run(...r));
    issues.forEach((r) => ii.run(...r));
  });
  tx();
  return true;
}

module.exports = seed;

if (require.main === module) {
  const reset = process.argv.includes("--reset");
  const done = seed({ reset });
  console.log(done ? "Database seeded with sample data." : "Database already has data (use --reset to overwrite).");
}
