const acme = require("acme-client");
const { make_friendly } = require("./errors");

// Uses the key from an uploaded ZIP, or makes a new RSA or ECDSA key.
async function make_key(key_type, key_pem) {
  if (key_pem) return key_pem;
  const key = key_type === "ecdsa"
    ? await acme.crypto.createPrivateEcdsaKey()
    : await acme.crypto.createPrivateRsaKey();
  return key.toString();
}

// Company details are optional. Empty ones are left out.
function clean_details(details = {}) {
  const pick = (value) => String(value || "").trim().slice(0, 64);
  const country = pick(details.country).toUpperCase();
  if (country && !/^[A-Z]{2}$/.test(country)) {
    throw make_friendly("The country code should be two letters, like US or GB.");
  }

  const fields = {
    country,
    state: pick(details.state),
    locality: pick(details.locality),
    organization: pick(details.organization),
  };
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value));
}

// A signing request (CSR) tells Let's Encrypt which domains the
// certificate is for and which key it belongs to.
async function make_signing_request(domains, { key_type, key_pem, details }) {
  const fields = clean_details(details);
  const private_key = await make_key(key_type, key_pem);
  const common_name = domains.find((domain) => !domain.startsWith("*.")) || domains[0];

  try {
    const [, csr] = await acme.crypto.createCsr(
      { commonName: common_name, altNames: domains, ...fields },
      private_key,
    );
    return { private_key, csr: csr.toString() };
  } catch (error) {
    if (key_pem) throw make_friendly("We could not use the private key from your ZIP. Please check that it is the right key.");
    throw error;
  }
}

module.exports = { make_signing_request };
