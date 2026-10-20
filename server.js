require("dotenv").config();
const express = require("express");
const cors = require("cors");
const seed = require("./src/seed");

seed(); // loads sample data on first run only

const app = express();
const origins = (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim());
app.use(cors({ origin: origins.includes("*") ? true : origins }));
app.use(express.json());

app.get("/", (_req, res) =>
  res.json({
    name: "The Reading Room API",
    endpoints: ["/api/dashboard", "/api/books", "/api/members", "/api/issues"],
  })
);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/dashboard", require("./src/routes/dashboard"));
app.use("/api/books", require("./src/routes/books"));
app.use("/api/members", require("./src/routes/members"));
app.use("/api/issues", require("./src/routes/issues"));

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? "Internal server error" : err.message });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Reading Room API running on http://localhost:${PORT}`));
}
module.exports = app;
