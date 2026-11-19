# Safety

## Nothing is stored

The server has no database and writes no files. Keys and certificates live
in memory only while a request runs. After the answer is sent, they are
gone.

## The order state is checked

Between part one and part two, the browser holds the order state (the
account key and two Let's Encrypt addresses). Because it comes back from
the browser, the server checks that both addresses still point to the
Let's Encrypt server. If anything else is there, the request is refused.
See `check_state` in `src/acme_setup.js`.

## Private keys

- New keys are made on the server with Node's built-in crypto tools.
- An uploaded key is only used to sign the request. It is checked against
  the certificate first, so a wrong key is caught early.
- The ZIP reminds you to keep `privkey.pem` secret.

## Limits on uploads

- The browser only sends `.zip` files under 2 MB.
- The server accepts requests up to 4 MB.
- Inside a ZIP, more than 30 files is refused and files over 256 KB are
  skipped. This protects the server from very large or tricky ZIPs.

## Checking websites

The live website check only connects to public addresses. Local and
private addresses (like `127.0.0.1` or `192.168.x.x`) are refused, so the
tool cannot be used to look inside private networks. The connection is
made to the exact address we checked, and it stops after 8 seconds.

## Input checks

- Domain names must look like real domains. Up to 100 per certificate.
- Emails must look like real emails.
- The country code must be two letters.

Every problem comes back as a clear, friendly message. Unknown errors are
written to the server log and shown to the person as a short, calm note.

## Headers

The server hides the `X-Powered-By` header and sends
`X-Content-Type-Options: nosniff` and a strict referrer policy.
