const path = require("path");
const express = require("express");
const { build_page } = require("./page");
const seo_routes = require("./seo_routes");

const app = express();
const client_folder = path.join(__dirname, "..", "client");
const send_page = (req, res) => res.type("html").send(build_page(req));

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
app.use(express.static(client_folder, { index: false, maxAge: "1h" }));
app.use(seo_routes);

app.use("/api", (req, res) => {
  res.status(404).json({ message: "This address does not exist." });
});

// Every other address gets the same single page.
app.get("*", send_page);

// Friendly replies when a request is too big or cannot be read.
app.use((error, req, res, next) => {
  const too_big = error.type === "entity.too.large";
  const message = too_big
    ? "That file is too big. A certificate ZIP is usually only a few KB."
    : "We could not read that request. Please try again.";
  res.status(error.status || 500).json({ message });
});

module.exports = app;
