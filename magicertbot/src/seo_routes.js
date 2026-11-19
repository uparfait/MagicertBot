const express = require("express");
const { tabs, home_path } = require("./page");

// Files that help search engines find and understand the site.
const router = express.Router();

function site_address(req) {
  return `${req.protocol}://${req.get("host")}`;
}

router.get("/robots.txt", (req, res) => {
  const lines = ["User-agent: *", "Allow: /", "Disallow: /api/", `Sitemap: ${site_address(req)}/sitemap.xml`];
  res.type("text/plain").send(`${lines.join("\n")}\n`);
});

router.get("/sitemap.xml", (req, res) => {
  const base_url = site_address(req);
  const entries = Object.values(tabs).map((tab) => [
    "  <url>",
    `    <loc>${base_url}${tab.path}</loc>`,
    "    <changefreq>monthly</changefreq>",
    `    <priority>${tab.path === home_path ? "1.0" : "0.8"}</priority>`,
    "  </url>",
  ].join("\n"));

  res.type("application/xml").send([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
  ].join("\n"));
});

module.exports = router;
