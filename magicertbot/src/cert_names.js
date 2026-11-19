// Turns the coded parts of a certificate into plain names.
const curve_names = { prime256v1: "P-256", secp384r1: "P-384", secp521r1: "P-521" };
const signatures = {
  "2a864886f70d01010b": "SHA-256 with RSA",
  "2a864886f70d01010c": "SHA-384 with RSA",
  "2a864886f70d01010d": "SHA-512 with RSA",
  "2a8648ce3d040302": "ECDSA with SHA-256",
  "2a8648ce3d040303": "ECDSA with SHA-384",
};

// Reads one line like "CN=example.com" from a subject or issuer.
const read_field = (text, name) => (String(text || "").split("\n").find((row) => row.startsWith(`${name}=`)) || "").slice(name.length + 1);

function issuer_name(cert) {
  const group = read_field(cert.issuer, "O");
  const name = read_field(cert.issuer, "CN");
  if (/staging/i.test(group + name)) return `Let's Encrypt testing server (${name.replace(/\(STAGING\)\s*/i, "")})`;
  return group === "Let's Encrypt" ? `Let's Encrypt ${name}` : [group, name].filter(Boolean).join(", ");
}

function describe_key(key) {
  const info = key.asymmetricKeyDetails || {};
  if (key.asymmetricKeyType === "rsa") return `RSA ${info.modulusLength}`;
  if (key.asymmetricKeyType === "ec") return `ECDSA ${curve_names[info.namedCurve] || info.namedCurve}`;
  return String(key.asymmetricKeyType).toUpperCase();
}

// The signature type is written in the certificate as a short code (an OID).
// The first known code in the certificate is the one used to sign it.
function signature_name(raw) {
  const hex = raw.toString("hex");
  const hits = Object.keys(signatures)
    .map((code) => [hex.indexOf(code), code])
    .filter(([at]) => at >= 0)
    .sort((a, b) => a[0] - b[0]);
  return hits.length ? signatures[hits[0][1]] : "Unknown";
}

module.exports = { read_field, issuer_name, describe_key, signature_name };
