const acme = require("acme-client");
const { make_friendly } = require("./errors");

const curves = { secp256r1: "P-256", secp384r1: "P-384" };
const rsa_sizes = [2048, 3072, 4096];

// Uses the current key when renewing with "keep the same key",
// otherwise makes a new ECDSA or RSA key.
async function make_key(settings, key_pem) {
  if (key_pem) return key_pem;
  if (settings.key_type === "rsa") {
    const size = rsa_sizes.includes(Number(settings.rsa_size)) ? Number(settings.rsa_size) : 2048;
    return (await acme.crypto.createPrivateRsaKey(size)).toString();
  }
  return (await acme.crypto.createPrivateEcdsaKey(curves[settings.curve] || "P-256")).toString();
}

// Company details are optional. Empty ones are left out.
function clean_details(details = {}) {
  const pick = (value) => String(value || "").trim().slice(0, 64);
  const country = pick(details.country).toUpperCase();
  if (country && !/^[A-Z]{2}$/.test(country)) throw make_friendly("The country code should be two letters, like US or GB.");

  const fields = { country, state: pick(details.state), locality: pick(details.locality), organization: pick(details.organization) };
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value));
}

// A signing request (CSR) tells Let's Encrypt which addresses the
// certificate is for and which key it belongs to.
async function make_signing_request(domains, settings = {}, key_pem = "") {
  const fields = clean_details(settings.details);
  const private_key = await make_key(settings, key_pem);
  const common_name = domains.find((domain) => !domain.startsWith("*.")) || domains[0];

  try {
    const [, csr] = await acme.crypto.createCsr({ commonName: common_name, altNames: domains, ...fields }, private_key);
    return { private_key, csr: csr.toString() };
  } catch (error) {
    if (key_pem) throw make_friendly("We could not use the private key from your zip. Please check that it is the right key.");
    throw error;
  }
}

// A short name for the key, like "ECDSA P-256" or "RSA 2048".
function key_label(settings = {}) {
  if (settings.key_type === "rsa") return `RSA ${rsa_sizes.includes(Number(settings.rsa_size)) ? settings.rsa_size : 2048}`;
  return `ECDSA ${curves[settings.curve] || "P-256"}`;
}

module.exports = { make_signing_request, key_label };
