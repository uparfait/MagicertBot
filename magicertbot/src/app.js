const path = require("path");
const express = require("express");
const { build_page } = require("./page");
const seo_routes = require("./seo_routes");
const certificate_routes = require("./routes/certificate_routes");
const check_routes = require("./routes/check_routes");
const payload = require("./payload");
const { setup_crash_guard } = require("./crash_guard");

setup_crash_guard();

const app = express();
const client_folder = path.join(__dirname, "..", "client");
// The page is never kept by the browser, so it always points to the newest files.
const send_page = (req, res) => res.set("Cache-Control", "no-cache").type("html").send(build_page(req));

app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(express.json({ limit: "4mb" }));

app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// The page parts are joined on the server, so they are never sent alone.
app.use("/parts", send_page);
// Styles and scripts live under a fingerprinted address, so they can be
// kept for a long time: a changed file always gets a new address.
app.use("/assets/:version", express.static(client_folder, { index: false, maxAge: "365d", immutable: true }));
app.use(express.static(client_folder, { index: false, maxAge: 0 }));
app.use(seo_routes);
// Every API request goes through the encrypted handshake first.
app.use("/api", payload);
app.use("/api/certificate", certificate_routes);
app.use("/api/check", check_routes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "This address does not exist." });
});

// Every other address gets the same single page.
app.get("*", send_page);

// Friendly replies when a request is too big or cannot be read.
app.use((error, req, res, next) => {
  if (res.headersSent) return res.end();
  const too_big = error.type === "entity.too.large";
  const message = too_big
    ? "That file is too big. A certificate ZIP is usually only a few KB."
    : "We could not read that request. Please try again.";
  res.status(error.status || 500).json({ message });
});

module.exports = app;
