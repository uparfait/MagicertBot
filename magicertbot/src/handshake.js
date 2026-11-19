const crypto = require("crypto");

// The server keeps one private key. Browsers use its public half to agree
// on a fresh secret for every request (ECDH), then encrypt with AES-GCM.
function load_private_key() {
  const stored = process.env.HANDSHAKE_PRIVATE_KEY;
  if (stored) return crypto.createPrivateKey({ key: Buffer.from(stored, "base64"), format: "der", type: "pkcs8" });
  console.warn("HANDSHAKE_PRIVATE_KEY is not set, so a temporary key is used. Run: npm run make_key");
  return crypto.generateKeyPairSync("ec", { namedCurve: "P-256" }).privateKey;
}

const private_key = load_private_key();
const public_key = crypto.createPublicKey(private_key).export({ format: "jwk" });
const key_id = crypto.createHash("sha256").update(public_key.x + public_key.y).digest("hex").slice(0, 16);
const salt = Buffer.from("magicertbot");

// A separate key, made from the private key, that seals order details.
const der = private_key.export({ format: "der", type: "pkcs8" });
const state_key = Buffer.from(crypto.hkdfSync("sha256", der, salt, Buffer.from("state"), 32));

// Both sides reach the same secret from their own private key and the other's public key.
function derive_payload_key(client_key) {
  const client_public = crypto.createPublicKey({
    key: { kty: "EC", crv: "P-256", x: String(client_key.x), y: String(client_key.y) },
    format: "jwk",
  });
  const shared = crypto.diffieHellman({ privateKey: private_key, publicKey: client_public });
  return Buffer.from(crypto.hkdfSync("sha256", shared, salt, Buffer.from("payload"), 32));
}

// The tag goes at the end of the data, the same way the browser's Web Crypto does it.
function seal_payload(key, value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final(), cipher.getAuthTag()]);
  return { iv: iv.toString("base64"), data: data.toString("base64") };
}

function open_payload(key, sealed) {
  const bytes = Buffer.from(String(sealed.data), "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(String(sealed.iv), "base64"));
  decipher.setAuthTag(bytes.subarray(bytes.length - 16));
  const text = Buffer.concat([decipher.update(bytes.subarray(0, bytes.length - 16)), decipher.final()]);
  return JSON.parse(text.toString("utf8"));
}

module.exports = { key_id, public_key: { kty: "EC", crv: "P-256", x: public_key.x, y: public_key.y }, state_key, derive_payload_key, seal_payload, open_payload };
