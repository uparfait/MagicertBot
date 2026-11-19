const fs = require("fs");
const path = require("path");

const acme_folder = path.join(__dirname, "..", "acme");

// Sends a check file from the acme folder at its Let's Encrypt address.
// Any other name goes on to the normal page handling.
function send_check_file(req, res, next) {
  const token = req.params.token;
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(token)) return next();
  const file = path.join(acme_folder, token);
  if (!fs.existsSync(file)) return next();
  res.set("Cache-Control", "no-store").type("text/plain").send(fs.readFileSync(file, "utf8"));
}

module.exports = { send_check_file };
