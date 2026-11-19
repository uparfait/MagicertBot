const express = require("express");
const { key_id, public_key, derive_payload_key, open_payload } = require("./handshake");

const five_minutes = 5 * 60 * 1000;
const router = express.Router();

// Step one of the handshake: the browser asks for our public key.
router.get("/handshake", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ key_id, public_key });
});

// Every other request arrives encrypted. We work out the shared key,
// open the payload, and keep the key so the answer is encrypted too.
router.post("*", (req, res, next) => {
  const envelope = req.body || {};
  if (envelope.key_id !== key_id) {
    return res.status(409).json({ type: "error", code: "handshake", message: "Please refresh the page and try again." });
  }

  try {
    const key = derive_payload_key(envelope.client_key || {});
    const payload = open_payload(key, envelope);
    if (Math.abs(Date.now() - Number(payload.sent_at)) > five_minutes) throw new Error("old request");

    req.body = payload;
    res.locals.payload_key = key;
    next();
  } catch {
    res.status(400).json({ type: "error", message: "We could not read this request. Please refresh the page and try again." });
  }
});

module.exports = router;
