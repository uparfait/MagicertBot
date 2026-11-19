const adm_zip = require("adm-zip");

// The same file names certbot uses, so the files feel familiar.
function split_chain(full_chain) {
  const blocks = full_chain.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) || [];
  const [certificate = "", ...chain] = blocks;
  return { certificate: `${certificate}\n`, chain: `${chain.join("\n")}\n` };
}

function make_readme({ domains, valid_until, staging }) {
  return [
    "Your SSL certificate from MagiCertbot",
    "",
    `Domains: ${domains.join(", ")}`,
    `Valid until: ${valid_until.slice(0, 10)}`,
    staging ? "Note: this is a test certificate. Browsers will not trust it." : "",
    "",
    "fullchain.pem  Your certificate plus the chain. Most web servers want this one.",
    "privkey.pem    Your private key. Keep it secret and never share it.",
    "cert.pem       Only your certificate, for servers that ask for it alone.",
    "chain.pem      The Let's Encrypt certificates that link yours to a trusted root.",
    "request.csr    The signing request. Only needed if your host asks for it.",
    "",
    "To renew, upload this ZIP in the Renew tab before the date above.",
    "",
  ].join("\r\n");
}

// Puts every file into one ZIP and returns it as base64 text for the browser.
function make_certificate_zip(details) {
  const { certificate, chain } = split_chain(details.certificate);
  const zip = new adm_zip();
  const files = {
    "fullchain.pem": details.certificate,
    "privkey.pem": details.private_key,
    "cert.pem": certificate,
    "chain.pem": chain,
    "request.csr": details.csr,
    "README.txt": make_readme(details),
  };

  for (const [name, text] of Object.entries(files)) zip.addFile(name, Buffer.from(text, "utf8"));

  const first_domain = details.domains[0].replace("*.", "wildcard.");
  const test_tag = details.staging ? "_test" : "";
  return {
    file_name: `${first_domain}${test_tag}_certificate.zip`,
    zip_base64: zip.toBuffer().toString("base64"),
  };
}

module.exports = { make_certificate_zip };
