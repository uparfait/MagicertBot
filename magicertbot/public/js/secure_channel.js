// Every request is encrypted before it leaves the browser.
// 1. We ask the server for its public key once (the handshake).
// 2. For each request we make a fresh key pair and agree on a shared
//    secret with the server (ECDH), then turn it into an AES-GCM key.
// 3. The payload and every answer line are encrypted with that key.
const encoder = new TextEncoder();
let server = null;

function to_base64(bytes) {
  let text = "";
  for (let start = 0; start < bytes.length; start += 0x8000) text += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
  return btoa(text);
}
const from_base64 = (text) => Uint8Array.from(atob(text), (letter) => letter.charCodeAt(0));

async function get_server_key() {
  if (server) return server;
  const response = await fetch("/api/handshake", { cache: "no-store" });
  const data = await response.json();
  const key = await crypto.subtle.importKey("jwk", data.public_key, { name: "ECDH", namedCurve: "P-256" }, false, []);
  server = { key_id: data.key_id, key };
  return server;
}

// Used when the server has a new key, so the next request asks again.
export const forget_server_key = () => { server = null; };

async function make_shared_key(server_key) {
  const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "ECDH", public: server_key }, pair.privateKey, 256);
  const base = await crypto.subtle.importKey("raw", bits, "HKDF", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: encoder.encode("magicertbot"), info: encoder.encode("payload") },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
  );
  const { x, y } = await crypto.subtle.exportKey("jwk", pair.publicKey);
  return { key, client_key: { x, y } };
}

export async function seal_request(body) {
  const { key_id, key: server_key } = await get_server_key();
  const { key, client_key } = await make_shared_key(server_key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = encoder.encode(JSON.stringify({ ...body, sent_at: Date.now() }));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
  return { key, envelope: { key_id, client_key, iv: to_base64(iv), data: to_base64(data) } };
}

export async function open_line(key, sealed) {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: from_base64(sealed.iv) }, key, from_base64(sealed.data));
  return JSON.parse(new TextDecoder().decode(plain));
}
