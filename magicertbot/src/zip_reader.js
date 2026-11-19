const path = require("path");
const adm_zip = require("adm-zip");
const { make_friendly } = require("./errors");

const max_entries = 30;
const max_file_size = 256 * 1024;

function open_zip(base64_text) {
  if (!base64_text) throw make_friendly("Please choose a ZIP file first.");
  try {
    return new adm_zip(Buffer.from(String(base64_text), "base64"));
  } catch {
    throw make_friendly("We could not open this ZIP file. Please check that it is a real .zip file.");
  }
}

// Reads the small text files inside the ZIP and skips folders and big files.
function read_text_files(zip) {
  const entries = zip.getEntries().filter((entry) => !entry.isDirectory && !entry.entryName.startsWith("__MACOSX/"));
  if (entries.length > max_entries) throw make_friendly("This ZIP has too many files. Please keep only your certificate files in it.");

  return entries.filter((entry) => entry.header.size <= max_file_size).map((entry) => {
    try {
      return { name: path.posix.basename(entry.entryName).toLowerCase(), text: entry.getData().toString("utf8") };
    } catch {
      throw make_friendly("We could not read the files inside this ZIP. If it has a password, please remove it.");
    }
  });
}

// When several files match, the best-known names win: fullchain.pem first,
// then cert.pem, and chain.pem last because it is not your own certificate.
function rank_name(name, best_names) {
  const index = best_names.indexOf(name);
  if (index !== -1) return index;
  return name === "chain.pem" ? 99 : best_names.length;
}

function pick_file(files, marker, best_names) {
  const matches = files.filter((file) => file.text.includes(marker));
  matches.sort((a, b) => rank_name(a.name, best_names) - rank_name(b.name, best_names));
  return matches[0];
}

function read_certificate_zip(base64_text) {
  const files = read_text_files(open_zip(base64_text));
  const certificate = pick_file(files, "-----BEGIN CERTIFICATE-----", ["fullchain.pem", "cert.pem"]);
  const private_key = pick_file(files, "PRIVATE KEY-----", ["privkey.pem"]);

  if (!certificate) {
    throw make_friendly("We couldn't find a certificate in this ZIP. It should hold a file like fullchain.pem or cert.pem.");
  }
  return {
    certificate_file: certificate.name,
    certificate_pem: certificate.text,
    key_pem: private_key ? private_key.text : "",
  };
}

module.exports = { read_certificate_zip };
