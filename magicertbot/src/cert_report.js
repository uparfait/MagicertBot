const path = require("path");
const { read_certificates, read_info, key_matches } = require("./cert_details");

function try_read(text) {
  try {
    return read_certificates(text);
  } catch {
    return [];
  }
}

// Looks at every file in the zip and returns what the report needs.
function build_report(zip, tracker) {
  const kinds = ["cert", "chain", "fullchain", "privkey", "readme"];
  const found = Object.fromEntries(kinds.map((kind) => [kind, Boolean(zip[kind])]));
  const base = { found, file_count: zip.file_count };

  tracker.at(2);
  const main = zip.cert || zip.fullchain;
  const certificates = main ? try_read(main.text) : [];
  if (!certificates.length) return { ...base, readable: false };

  const folder = path.posix.dirname(main.path);
  const info = read_info(certificates[0], folder === "." ? "" : path.posix.basename(folder));

  tracker.at(4);
  const key_match = !zip.privkey ? "missing" : key_matches(certificates[0], zip.privkey.text) ? "yes" : "no";
  const chain_ok = zip.fullchain ? try_read(zip.fullchain.text).length >= 2 : false;

  tracker.at(5);
  const test_cert = /testing/i.test(info.issuer);

  tracker.at(6);
  return {
    ...base, readable: true, info, key_match, chain_ok, test_cert,
  };
}

module.exports = { build_report };
