const path = require("path");
const adm_zip = require("adm-zip");
const { make_friendly } = require("./errors");

const max_entries = 30;
const max_file_size = 256 * 1024;

function open_zip(base64_text) {
  if (!base64_text) throw make_friendly("Please choose a zip file first.");
  try {
    return new adm_zip(Buffer.from(String(base64_text), "base64"));
  } catch {
    throw make_friendly("We could not open this zip. Please choose the zip you downloaded from MagicertBot.");
  }
}

// Reads the small text files inside the zip and skips folders and big files.
function read_text_files(zip) {
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory && !entry.entryName.startsWith("__MACOSX"));
  if (entries.length > max_entries) throw make_friendly("This zip has too many files. Please keep only your certificate files in it.");

  return entries.filter((entry) => entry.header.size <= max_file_size).map((entry) => {
    try {
      return { path: entry.entryName, text: entry.getData().toString("utf8") };
    } catch {
      throw make_friendly("We could not read the files inside this zip. If it has a password, please remove it.");
    }
  });
}

// Finds each known file by its name, like Certbot names them.
// Unknown names still work when the text inside looks right.
function read_certificate_zip(base64_text) {
  const files = read_text_files(open_zip(base64_text));
  const found = {};

  for (const file of files) {
    const base = path.posix.basename(file.path).toLowerCase();
    const kind = base.startsWith("readme") ? "readme"
      : { "cert.pem": "cert", "chain.pem": "chain", "fullchain.pem": "fullchain", "privkey.pem": "privkey" }[base];
    if (kind && !found[kind]) found[kind] = file;
  }

  if (!found.cert && !found.fullchain) {
    found.cert = files.find((file) => file.text.includes("-----BEGIN CERTIFICATE-----") && !/chain/i.test(file.path));
  }
  if (!found.privkey) found.privkey = files.find((file) => file.text.includes("PRIVATE KEY-----"));

  return { ...found, file_count: files.length };
}

module.exports = { read_certificate_zip };
