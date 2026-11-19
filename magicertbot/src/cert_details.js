const { X509Certificate, createPrivateKey } = require("crypto");
const { make_friendly } = require("./errors");

const curve_names = { prime256v1: "P-256", secp384r1: "P-384", secp521r1: "P-521" };
const day_in_ms = 24 * 60 * 60 * 1000;

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

function read_field(text, name) {
  const line = String(text || "").split("\n").find((row) => row.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1) : "";
}

function read_domains(certificate) {
  const names = (certificate.subjectAltName || "").split(", ").filter((item) => item.startsWith("DNS:")).map((item) => item.slice(4));
  return names.length ? names : [read_field(certificate.subject, "CN")].filter(Boolean);
}

function describe_key(public_key) {
  const info = public_key.asymmetricKeyDetails || {};
  if (public_key.asymmetricKeyType === "rsa") return `RSA ${info.modulusLength} bit`;
  if (public_key.asymmetricKeyType === "ec") return `ECDSA ${curve_names[info.namedCurve] || info.namedCurve}`;
  return String(public_key.asymmetricKeyType).toUpperCase();
}

function key_matches(certificate, key_pem) {
  try {
    return certificate.checkPrivateKey(createPrivateKey(key_pem));
  } catch {
    throw make_friendly("We found a private key in your ZIP but could not read it. If it has a password, please remove it.");
  }
}

function describe_certificate(certificate, extra = {}) {
  const valid_from = new Date(certificate.validFrom);
  const valid_to = new Date(certificate.validTo);
  const days_left = Math.floor((valid_to - Date.now()) / day_in_ms);
  let status = days_left < 0 ? "expired" : days_left <= 30 ? "expiring" : "valid";
  if (valid_from > new Date()) status = "not_yet_valid";

  return {
    status, days_left, domains: read_domains(certificate),
    issued_to: read_field(certificate.subject, "O") || read_field(certificate.subject, "CN"),
    issued_by: [read_field(certificate.issuer, "O"), read_field(certificate.issuer, "CN")].filter(Boolean).join(", "),
    valid_from: valid_from.toISOString(), valid_to: valid_to.toISOString(),
    key: describe_key(certificate.publicKey), serial_number: certificate.serialNumber,
    fingerprint: certificate.fingerprint256, is_self_signed: certificate.checkIssued(certificate), ...extra,
  };
}

module.exports = { read_certificates, read_domains, key_matches, describe_certificate };
