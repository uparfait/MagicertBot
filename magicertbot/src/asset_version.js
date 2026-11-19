const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const client_folder = path.join(__dirname, "..", "client");

// A short fingerprint of every style and script file. It goes into their
// addresses (/assets/<fingerprint>/js/main.js), so when any file changes
// the address changes too, and no browser can keep running old code.
function make_asset_version() {
  const hash = crypto.createHash("sha256");
  for (const folder of ["css", "js"]) {
    const full = path.join(client_folder, folder);
    for (const name of fs.readdirSync(full).sort()) {
      hash.update(name);
      hash.update(fs.readFileSync(path.join(full, name)));
    }
  }
  return hash.digest("hex").slice(0, 12);
}

const asset_version = make_asset_version();

module.exports = { asset_version, client_folder };
