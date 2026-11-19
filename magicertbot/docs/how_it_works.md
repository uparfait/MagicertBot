# How it works

## The big picture

1. The browser shows one page with three tabs.
2. Each tab moves through a few steps, like "Your website", "Prove it's
   yours" and "Creating your certificate".
3. When a step needs the server, the page sends an encrypted request
   (see `secure_requests.md`).
4. The server talks to Let's Encrypt, reads zip files or connects to
   websites, and sends back small progress updates while it works.
5. The page shows the result, or a zip to download.

## No database

The server saves nothing. Vercel starts a fresh copy of the app for many
requests and throws it away afterwards, so nothing could be kept there
anyway.

Getting a certificate needs two requests, with a pause in between while
you add your proof. The details of the order (the Let's Encrypt account
key and the order address) must survive that pause. So the server seals
them with a key only it knows, and the browser carries the sealed text to
the next request. The browser cannot read it or change it. See
`secure_requests.md`.

## How this relates to Certbot

[Certbot](https://certbot.eff.org) is the well-known tool for getting
Let's Encrypt certificates. It talks to Let's Encrypt in a language called
**ACME**.

Certbot is a program you install on your own server. Vercel cannot run
it, because each request runs for a short time in a small, read-only
space. So MagicertBot uses
[acme-client](https://github.com/publishlab/node-acme-client), a Node.js
library that speaks the same ACME language.

Both ways of proving ownership match Certbot's own:

| MagicertBot | Certbot |
| --- | --- |
| Check file | `--webroot` (the http-01 check) |
| DNS record | `--manual --preferred-challenges dns` |

The files in the zip also use Certbot's names: `cert.pem`, `chain.pem`,
`fullchain.pem` and `privkey.pem`.

## What MagicertBot does not do

MagicertBot never logs in to your server or your DNS account. You place
the check file or add the DNS record yourself, and you put the finished
files on your web server yourself. It also cannot renew on its own: come
back with your zip before the certificate ends.
