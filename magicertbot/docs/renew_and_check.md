# Renewing and checking certificates

## Renewing

Files: `public/js/renew.js`, `public/js/renew_run.js`

**Step 1: Upload.** Drop the zip on the upload area. While it uploads you
see a gear and the upload percent. The server reads the zip and the page
shows how many days are left and which files were found. Renewing needs
both your certificate and `privkey.pem`.

Then pick from three switches:

- **Renew now, even if it is not due**: we normally only renew when 30
  days or less are left. Without this switch, an early renewal shows "No
  renewal needed yet" and stops there.
- **Keep the same private key**: the new certificate uses the key from
  your zip. The server first checks that the key belongs to the
  certificate.
- **Test run only**: does every step on the practice server, but keeps no
  certificate.

**Step 2: Prove it's still yours.** Let's Encrypt asks again every time,
so this works the same as for a new certificate.

**Step 3: Renewing.** The same as for a new certificate. A new key keeps
the same type and strength as your old one. The zip is named
`<name>_renewed.zip`.

## Checking a zip

Files: `src/cert_report.js`, `public/js/check_report.js`

Node.js has a built-in `X509Certificate` class that reads certificates.
The report shows:

- days left, with a bar and a badge: Valid, Renew soon or Expired
- a plain summary in one paragraph
- health checks: the dates, whether the private key matches, whether
  the full chain is complete, how strong the key is, whether it is a test
  certificate, and whether it covers every sub address
- details: addresses, issuer, dates, key type, signature, serial number
  and SHA-256 fingerprint
- which files the zip holds, and which are missing

## Checking a live website

Files: `src/site_certificate.js`, `public/js/site_report.js`

1. Clean the address, so `https://example.com/page` becomes `example.com`.
2. Look up its IP address and refuse private or local addresses.
3. Open a secure connection on port 443 and read the certificate.
4. Keep the certificate even when it has a problem, so we can explain the
   problem, such as an expired certificate or a missing middle one.

The report shows whether browsers trust it, plus the same days left and
details as for a zip.
