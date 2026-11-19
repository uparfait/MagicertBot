# Renewing and checking certificates

## Renewing (`POST /api/certificate/renew`)

Renewing simply means getting a new certificate for the same domains.

1. Read the ZIP (see `zip_files.md`).
2. Read the domain names from the certificate's **Subject Alternative
   Names** list. That list holds every domain the certificate covers.
3. If the ZIP holds a private key, make sure it belongs to the
   certificate. If not, stop and explain why.
4. Start a normal order with those domains (see `new_certificate.md`).
   The private key travels inside the state, so part two keeps using it.
5. Part two is the same as for a new certificate.

Keeping the same key is handy when your key is pinned somewhere or used
by other tools. Leaving the key out gives you a new, fresh one.

## Checking a ZIP (`POST /api/check/file`)

File: `src/cert_details.js`

Node.js has a built-in `X509Certificate` class that reads certificates
without any extra library. From it we take:

- the domains, the owner and the issuer
- the start and end dates, and the days left
- the key type, such as `RSA 2048 bit` or `ECDSA P-256`
- the serial number and the SHA-256 fingerprint
- whether the certificate signed itself (self-signed)
- how many certificates the file holds

If the ZIP also holds a private key, `checkPrivateKey` tells us if the key
and the certificate belong together.

The status badge follows simple rules:

| Badge | When |
| --- | --- |
| Valid | More than 30 days left |
| Expires soon | 30 days or less |
| Expired | The end date has passed |
| Not valid yet | The start date is still in the future |

## Checking a live website (`POST /api/check/domain`)

File: `src/site_certificate.js`

1. Clean the address, so `https://example.com/page` becomes `example.com`.
2. Look up its IP address and refuse private or local addresses.
3. Open a TLS connection on port 443, just like a browser.
4. Keep the certificate even if a browser would show a warning, so we can
   explain the problem, such as an expired certificate or a missing chain.
5. Give up after 8 seconds if the website does not answer.
