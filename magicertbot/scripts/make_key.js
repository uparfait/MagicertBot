// Makes a private key for the handshake. Put the printed value in an
// environment variable named HANDSHAKE_PRIVATE_KEY (for example in Vercel).
const crypto = require("crypto");

const { privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
const value = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64");

console.log("HANDSHAKE_PRIVATE_KEY=" + value);
