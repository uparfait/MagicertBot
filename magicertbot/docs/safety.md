# Safety

## Nothing is stored

There is no database and no file is written. Keys and certificates live
in memory only while a request runs.

## Encrypted and sealed

Every request and answer is encrypted with a fresh key, and the order
details are sealed so the browser cannot read or change them. See
`secure_requests.md`.

## The order stays with Let's Encrypt

Even after the seal is opened, the server checks that the account and
order addresses point to the Let's Encrypt server and nowhere else. See
`check_state` in `src/acme_setup.js`.

## Check files

- The pasted address must be on the same domain that was entered before.
  This is checked in the browser and again on the server.
- The server opens the file itself on plain http, the same way Let's
  Encrypt does, and checks every redirect along the way.

## Only public websites

The check file test and the live website check only connect to public
addresses. Local and private ones (like `127.0.0.1` or `192.168.x.x`) are
refused, so the tool cannot be used to look inside private networks. See
`src/net_safety.js`. Connections stop after 8 seconds.

## Private keys

- New keys are made on the server with Node's built-in crypto tools.
- A key from your zip is only used when you turn on "Keep the same private
  key", and only after it is checked against the certificate.

## Limits on uploads

- The page only sends `.zip` files under 2 MB.
- The server accepts requests up to 4 MB.
- Inside a zip, more than 30 files is refused and files over 256 KB are
  skipped.

## Input checks

- Addresses must look like real domains. Up to 100 per certificate.
- Emails must look like real emails.
- The certificate name may only use letters, numbers, dots, dashes and
  underscores.
- The country code must be two letters.

Every problem comes back as a clear, friendly message. Unknown errors go
to the server log, and the person sees a short, calm note.
