const fs = require("fs");
const path = require("path");

const parts_folder = path.join(__dirname, "..", "client", "parts");
const part_names = ["head", "header", "panel_new", "panel_renew", "panel_check", "footer"];

// The page is split into small parts. We join them once when the app starts.
const template = part_names
  .map((name) => fs.readFileSync(path.join(parts_folder, `${name}.html`), "utf8"))
  .join("\n");

const tabs = {
  new: {
    path: "/",
    title: "Free SSL certificates in minutes",
    description: "Get a free Let's Encrypt SSL certificate for your website in a few minutes. Add one DNS record, then download your certificate and key.",
  },
  renew: {
    path: "/renew",
    title: "Renew your SSL certificate",
    description: "Upload your current SSL certificate and get a fresh Let's Encrypt certificate for the same domains, with live progress as it happens.",
  },
  check: {
    path: "/check",
    title: "Check an SSL certificate",
    description: "Check any SSL certificate from a file or a live website. See the domains it covers, who issued it and how many days it has left.",
  },
};

function find_tab(url_path) {
  const clean_path = url_path.replace(/\/+$/, "") || "/";
  const found = Object.keys(tabs).find((name) => tabs[name].path === clean_path);
  return found || "new";
}

function escape_html(text) {
  const swaps = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(text).replace(/[&<>"']/g, (letter) => swaps[letter]);
}

// Fills in the title, description, address and the open tab for this request.
function build_page(req) {
  const tab = find_tab(req.path);
  const base_url = `${req.protocol}://${req.get("host")}`;
  const values = { ...tabs[tab], base_url, canonical: base_url + tabs[tab].path };

  for (const name of Object.keys(tabs)) {
    values[`${name}_selected`] = String(name === tab);
    values[`${name}_tabindex`] = name === tab ? "0" : "-1";
    values[`${name}_hidden`] = name === tab ? "" : "hidden";
    values[`${name}_title`] = `${tabs[name].title} | MagiCertbot`;
  }

  return template.replace(/{{(\w+)}}/g, (match, key) => escape_html(values[key] ?? ""));
}

module.exports = { build_page, tabs };
