const { X509Certificate, createPrivateKey } = require("crypto");
const { make_friendly } = require("./errors");
const { read_field, issuer_name, describe_key, signature_name } = require("./cert_names");

// Node's built-in X509Certificate reads every certificate in the text.
function read_certificates(pem) {
  const blocks = String(pem).match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) || [];
  if (!blocks.length) throw make_friendly("We couldn't find a certificate in this file.");
  try {
    return blocks.map((block) => new X509Certificate(block));
  } catch {
    throw make_friendly("This certificate seems to be damaged, so we can't read it.");
  }
}

function read_domains(cert) {
  const names = (cert.subjectAltName || "").split(", ").filter((item) => item.startsWith("DNS:")).map((item) => item.slice(4));
  return names.length ? names : [read_field(cert.subject, "CN")].filter(Boolean);
}

// Everything the page shows about one certificate.
function read_info(certificate, name = "") {
  const cert = typeof certificate === "string" ? read_certificates(certificate)[0] : certificate;
  const domains = read_domains(cert);
  const clean_name = /^[a-z0-9*][a-z0-9.*_-]{0,120}$/i.test(String(name)) ? String(name) : "";

  return {
    name: clean_name || domains[0].replace(/^\*\./, ""),
    domains,
    from: new Date(cert.validFrom).toISOString(),
    to: new Date(cert.validTo).toISOString(),
    issuer: issuer_name(cert),
    key: describe_key(cert.publicKey),
    signature: signature_name(cert.raw),
    serial: cert.serialNumber.replace(/(..)(?!$)/g, "$1:"),
    fingerprint: cert.fingerprint256,
    self_signed: cert.checkIssued(cert),
  };
}

function key_matches(cert, key_pem) {
  try {
    return cert.checkPrivateKey(createPrivateKey(key_pem));
  } catch {
    return false;
  }
}

module.exports = { read_certificates, read_domains, read_info, key_matches };
