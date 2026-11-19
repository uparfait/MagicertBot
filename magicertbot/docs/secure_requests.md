# Secure requests

Vercel already serves the site over HTTPS. On top of that, every API
request and every answer line is encrypted by the app itself. People
using the page never see any of this.

## The handshake

Files: `src/handshake.js`, `src/payload.js`, `client/js/secure_channel.js`

1. The server has one private key (ECDH on the P-256 curve). The browser
   asks for its public half once, from `GET /api/handshake`.
2. For every request, the browser makes a brand new key pair.
3. The browser mixes its new private key with the server's public key.
   The server mixes its private key with the browser's public key. Both
   reach the same shared secret. This is called ECDH.
4. Both sides turn that secret into an AES-256-GCM key with HKDF.
5. The browser encrypts the request with that key and sends its public
   key, a random IV and the encrypted data.
6. The server works out the same key, opens the request and encrypts
   every answer line with it.

AES-GCM also adds a tag, so any change to the data on the way is caught.
The page ignores any answer line that is not encrypted, except a plain
"please refresh" error.
Each request also carries the time it was sent, and the server refuses
requests older than 5 minutes.

If the server's key changes (for example after a restart without a saved
key), it answers "handshake". The page then asks for the new public key
and tries once more on its own.

## Sealed order details

File: `src/sealed_state.js`

The order details from part one go back to the browser sealed with a
second key, made from the server's private key. The browser keeps the
sealed text and sends it back in part two. Nobody but the server can read
or change it, and it stops working after 7 days.

## The server key

Make one with:

```bash
npm run make_key
```

Put the printed value in an environment variable named
`HANDSHAKE_PRIVATE_KEY`. On Vercel, add it under **Settings →
Environment Variables**. Every copy of the app then uses the same key,
so a request can start on one copy and finish on another.

Without it, the app makes a temporary key when it starts. That is fine on
your own computer, but on Vercel sealed orders could stop working between
steps.
