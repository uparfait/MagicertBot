const fs = require("fs");
const path = require("path");
const { asset_version } = require("./asset_version");

// The page parts live outside the public folder, so they are never sent on their own.
const parts_folder = path.join(__dirname, "..", "views");
const part_names = ["head", "header", "new_settings", "new_options", "new_finish", "renew", "check", "footer"];

// The page is split into small parts. We join them once when the app starts.
const template = part_names
  .map((name) => fs.readFileSync(path.join(parts_folder, `${name}.html`), "utf8"))
  .join("\n");

const tabs = {
  new: {
    path: "/create-new-certificate",
    title: "Free SSL Certificates Made Simple",
    description: "Create, renew and check free SSL certificates for your website. Pick your web server, prove the site is yours and download everything in one zip.",
  },
  renew: {
    path: "/renew-certificate",
    title: "Renew your SSL certificate",
    description: "Upload the zip with your current SSL certificate and get a fresh one for the same addresses. It lasts another 90 days.",
  },
  check: {
    path: "/check-existing-certificate",
    title: "Check an SSL certificate",
    description: "Check an SSL certificate from your zip or a live website. See what it covers, who issued it, how many days it has left and what to fix.",
  },
};

// The tab for an address, or null when the address is not a tab.
function find_tab(url_path) {
  const clean_path = url_path.replace(/\/+$/, "").toLowerCase();
  return Object.keys(tabs).find((name) => tabs[name].path === clean_path) || null;
}

// Where every other address is sent.
const home_path = tabs.new.path;

const swaps = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape_html = (text) => String(text).replace(/[&<>"']/g, (letter) => swaps[letter]);

// Fills in the title, description, address and the open tab for this request.
function build_page(req) {
  const tab = find_tab(req.path) || "new";
  const base_url = `${req.protocol}://${req.get("host")}`;
  const values = { ...tabs[tab], base_url, canonical: base_url + tabs[tab].path, asset_version };

  for (const name of Object.keys(tabs)) {
    values[`${name}_selected`] = String(name === tab);
    values[`${name}_tabindex`] = name === tab ? "0" : "-1";
    values[`${name}_hidden`] = name === tab ? "" : "hidden";
    values[`${name}_title`] = `${tabs[name].title} from MagicertBot`;
  }

  return template.replace(/{{(\w+)}}/g, (match, key) => escape_html(values[key] ?? ""));
}

module.exports = { build_page, find_tab, home_path, tabs };
