const path = require("path");
const express = require("express");
const { build_page, find_tab, home_path } = require("./page");
const seo_routes = require("./seo_routes");
const certificate_routes = require("./routes/certificate_routes");
const check_routes = require("./routes/check_routes");
const payload = require("./payload");
const { setup_crash_guard } = require("./crash_guard");

setup_crash_guard();

const app = express();
const public_folder = path.join(__dirname, "..", "public");
// Each tab has its own address. Every other address is sent to the
// create page. The page is never cached, so it always points to the newest files.
const go_home = (req, res) => res.redirect(301, home_path);
const send_page = (req, res) => {
  if (!find_tab(req.path)) return go_home(req, res);
  res.set("Cache-Control", "no-cache").type("html").send(build_page(req));
};

app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.json({ limit: "4mb" }));

app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// The page parts are joined on the server, so they are never sent alone.
app.use("/parts", go_home);
// Styles and scripts live under a fingerprinted address, so they can be
// kept for a long time: a changed file always gets a new address.
app.use("/assets/:version", express.static(public_folder, { index: false, maxAge: "365d", immutable: true }));
app.use(express.static(public_folder, { index: false, maxAge: 0 }));
app.use(seo_routes);
app.get("/.well-known/acme-challenge/:token", require("./acme_files").send_check_file);
// Every API request goes through the encrypted handshake first.
app.use("/api", payload);
app.use("/api/certificate", certificate_routes);
app.use("/api/check", check_routes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "This address does not exist." });
});

// The three tab addresses get the page, and every other address goes home.
app.get("*", send_page);

// Friendly replies when a request is too big or cannot be read.
app.use((error, req, res, next) => {
  if (res.headersSent) return res.end();
  const too_big = error.type === "entity.too.large";
  const message = too_big ? "That file is too big. A certificate ZIP is usually only a few KB." : "We could not read that request. Please try again.";
  res.status(error.status || 500).json({ message });
});

module.exports = app;
