const tls = require("tls");
const { find_public_address } = require("./net_safety");
const { make_friendly } = require("./errors");

const trust_notes = {
  CERT_HAS_EXPIRED: "The certificate has expired.",
  CERT_NOT_YET_VALID: "The certificate is not valid yet.",
  DEPTH_ZERO_SELF_SIGNED_CERT: "The certificate is self-signed.",
  SELF_SIGNED_CERT_IN_CHAIN: "The chain ends in a certificate browsers do not know.",
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "The server is missing the middle certificate.",
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: "The server is missing the middle certificate.",
  ERR_TLS_CERT_ALTNAME_INVALID: "The certificate does not cover this address.",
};

// Connects the same way a browser does and keeps the certificate the
// website sends back, even when a browser would show a warning.
async function fetch_site_certificate(host) {
  const address = await find_public_address(host);

  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: address, port: 443, servername: host, rejectUnauthorized: false, timeout: 8000,
    });

    socket.once("secureConnect", () => {
      const certificate = socket.getPeerX509Certificate();
      const trusted = socket.authorized;
      const code = socket.authorizationError;
      socket.end();

      if (!certificate) return reject(make_friendly("This website did not send a certificate."));
      const trust_note = code ? trust_notes[code] || `Browsers would show a warning (${code}).` : "";
      resolve({ certificate, trusted, trust_note });
    });

    socket.once("timeout", () => {
      socket.destroy();
      reject(make_friendly(`${host} took too long to answer. Please try again.`));
    });
    socket.once("error", reject);
  });
}

module.exports = { fetch_site_certificate };
