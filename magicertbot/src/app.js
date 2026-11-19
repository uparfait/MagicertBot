const path = require("path");
const express = require("express");
const { build_page } = require("./page");

const app = express();
const client_folder = path.join(__dirname, "..", "client");

app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(express.static(client_folder, { index: false, maxAge: "1h" }));

app.use("/api", (req, res) => {
  res.status(404).json({ message: "This address does not exist." });
});

// Every other address gets the same single page.
app.get("*", (req, res) => {
  res.type("html").send(build_page(req));
});

module.exports = app;
