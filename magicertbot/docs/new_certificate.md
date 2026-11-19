# Getting a new certificate

Getting a certificate happens in two parts, with a short pause in between
while you add DNS records.

## Part one: start (`POST /api/certificate/start`)

File: `src/order_start.js`

1. Make a new, short-lived **account key**. Let's Encrypt uses it to know
   who is asking.
2. Create a Let's Encrypt **account** with that key. The email is optional.
3. Place an **order** for the domain names.
4. For each domain, ask for the **DNS check** and work out the TXT record:
   - Name: `_acme-challenge.` plus the domain
   - Value: a short code made from the account key and the check

The server sends back the records and a small **state** object: the
account key, the account address and the order address. The browser keeps
the state and sends it back in part two. This is how we avoid saving
anything on the server.

## The pause: adding records

The page lists each record with copy buttons. Two domains such as
`example.com` and `*.example.com` share one record name, so the page
reminds you to add both values.

## Part two: finish (`POST /api/certificate/finish`)

File: `src/order_finish.js`

1. Check the state still points to Let's Encrypt (see `safety.md`).
2. Look up the TXT records **ourselves first**. If a record is not there
   yet, we stop and ask you to wait. The order stays open, so you can
   simply press the button again later. If we let Let's Encrypt look too
   early and it fails, the whole order would be closed.
3. Ask Let's Encrypt to check the records, and wait until it agrees.
4. Make the **private key** (RSA 2048 or ECDSA P-256) and a **signing
   request** (CSR). See `src/signing_request.js`.
5. Send the signing request. Let's Encrypt signs the certificate.
6. Download the certificate and pack every file into one ZIP.

## Company details

The optional company name, country, state and city are added to the
signing request. Let's Encrypt only prints domain names on the final
certificate, so these details stay in `request.csr`.

## Test mode

Test mode uses the Let's Encrypt **staging** server. It works the same way
but has much higher limits, so it is safe for practice. Browsers do not
trust its certificates, and the ZIP name ends with `_test`.
