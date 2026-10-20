const router = require("express").Router();
const db = require("../db");
const { HttpError, nextId, iso } = require("../utils");

const withLoans = `
  SELECT m.*, (SELECT COUNT(*) FROM issues i WHERE i.member_id = m.id AND i.return_date IS NULL) AS activeLoans
  FROM members m`;

router.get("/", (_req, res) => {
  res.json(db.prepare(`${withLoans} ORDER BY CAST(SUBSTR(m.id,3) AS INTEGER)`).all());
});

router.get("/:id", (req, res) => {
  const m = db.prepare(`${withLoans} WHERE m.id = ?`).get(req.params.id);
  if (!m) throw new HttpError(404, "Member not found");
  res.json(m);
});

function validate(b, partial = false) {
  if (!partial || b.name !== undefined) if (!b.name || !String(b.name).trim()) throw new HttpError(400, "Name is required");
  if (!partial || b.email !== undefined) {
    if (!b.email || !/^\S+@\S+\.\S+$/.test(b.email)) throw new HttpError(400, "A valid email is required");
  }
}

router.post("/", (req, res) => {
  validate(req.body);
  const { name, email, phone = "" } = req.body;
  const id = nextId(db, "members", "M", 5, 2);
  try {
    db.prepare("INSERT INTO members (id,name,email,phone,joined) VALUES (?,?,?,?,?)")
      .run(id, name.trim(), email.trim().toLowerCase(), phone.trim(), iso());
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) throw new HttpError(409, "A member with this email already exists");
    throw e;
  }
  res.status(201).json(db.prepare(`${withLoans} WHERE m.id = ?`).get(id));
});

router.put("/:id", (req, res) => {
  const m = db.prepare("SELECT * FROM members WHERE id = ?").get(req.params.id);
  if (!m) throw new HttpError(404, "Member not found");
  validate(req.body, true);
  const next = {
    name: (req.body.name ?? m.name).trim(),
    email: (req.body.email ?? m.email).trim().toLowerCase(),
    phone: (req.body.phone ?? m.phone).trim(),
  };
  try {
    db.prepare("UPDATE members SET name=?, email=?, phone=? WHERE id=?").run(next.name, next.email, next.phone, m.id);
  } catch (e) {
    if (String(e.message).includes("UNIQUE")) throw new HttpError(409, "A member with this email already exists");
    throw e;
  }
  res.json(db.prepare(`${withLoans} WHERE m.id = ?`).get(m.id));
});

router.delete("/:id", (req, res) => {
  const m = db.prepare("SELECT id FROM members WHERE id = ?").get(req.params.id);
  if (!m) throw new HttpError(404, "Member not found");
  const active = db.prepare("SELECT COUNT(*) c FROM issues WHERE member_id = ? AND return_date IS NULL").get(m.id).c;
  if (active > 0) throw new HttpError(409, "Can't remove — member has a book on loan");
  db.transaction(() => {
    db.prepare("DELETE FROM issues WHERE member_id = ?").run(m.id);
    db.prepare("DELETE FROM members WHERE id = ?").run(m.id);
  })();
  res.json({ message: "Member removed" });
});

module.exports = router;
