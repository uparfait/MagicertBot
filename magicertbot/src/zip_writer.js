const adm_zip = require("adm-zip");
const { make_readme } = require("./readme_writer");

// Splits the full chain into your own certificate and the middle one.
function split_chain(full_chain) {
  const blocks = full_chain.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) || [];
  const [leaf = "", ...chain] = blocks;
  return { leaf: `${leaf}\n`, chain: chain.length ? `${chain.join("\n")}\n` : "" };
}

// Packs every file into one folder named after the certificate,
// with the same file names Certbot uses.
function make_certificate_zip({ info, certificate, private_key, settings }) {
  const { leaf, chain } = split_chain(certificate);
  const entries = {
    "cert.pem": leaf,
    "chain.pem": chain,
    "fullchain.pem": certificate,
    "privkey.pem": private_key,
    "README.txt": make_readme(info),
  };

  const zip = new adm_zip();
  const included = [];
  for (const [name, text] of Object.entries(entries)) {
    if (!text.trim()) continue;
    zip.addFile(`${info.name}/${name}`, Buffer.from(text, "utf8"));
    included.push(name);
  }

  const buffer = zip.toBuffer();
  const ending = settings.is_renewal ? "renewed" : "certificate";
  return {
    file_name: `${info.name.replace(/[^a-z0-9.-]/gi, "_")}_${ending}.zip`,
    zip_base64: buffer.toString("base64"),
    zip_size: buffer.length,
    included,
  };
}

module.exports = { make_certificate_zip };
