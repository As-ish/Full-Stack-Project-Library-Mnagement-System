const iso = (d = new Date()) => d.toISOString().slice(0, 10);

const addDays = (d, n) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

const daysBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// next id like B-109 / M-05 / R-1007
function nextId(db, table, prefix, start, pad = 0) {
  const row = db
    .prepare(`SELECT id FROM ${table} ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1`)
    .get();
  const n = row ? parseInt(row.id.slice(2), 10) + 1 : start;
  return `${prefix}-${pad ? String(n).padStart(pad, "0") : n}`;
}

const GENRES = [
  "Fiction", "Non-Fiction", "History", "Self-Help", "Sci-Fi",
  "Thriller", "Memoir", "Science", "Biography", "Poetry",
];

module.exports = { iso, addDays, daysBetween, HttpError, nextId, GENRES };
