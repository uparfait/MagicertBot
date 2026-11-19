# How it works

## The big picture

1. The browser shows one page with three tabs.
2. When you press a button, the page sends a request to our Express server.
3. The server talks to Let's Encrypt, reads files or connects to websites.
4. While it works, the server sends small progress updates back.
5. When it is done, the page shows the result or starts a download.

Nothing is saved on the server. Every request carries all the details it
needs, and the server forgets them as soon as the answer is sent.

## How this relates to certbot

[Certbot](https://certbot.eff.org) is the well-known command line tool for
getting Let's Encrypt certificates. It talks to Let's Encrypt using a
language called **ACME**.

Certbot itself is a Python program. It needs to be installed on a server
and usually needs control of that server's web port. Vercel does not offer
either of those things: each request runs for a short time in a small,
read-only space.

So instead of running the certbot program, MagiCertbot uses
[acme-client](https://github.com/publishlab/node-acme-client), a Node.js
library that speaks the same ACME language. The steps match this certbot
command:

```bash
certbot certonly --manual --preferred-challenges dns -d example.com
```

That command asks you to add a DNS TXT record, waits for you, and then
gets the certificate. MagiCertbot does the same, but in your browser.

The files you download also use certbot's names: `fullchain.pem`,
`privkey.pem`, `cert.pem` and `chain.pem`. If you already know certbot,
nothing will feel new.

## Why a DNS record?

Let's Encrypt only gives a certificate to someone who controls the domain.
There are two common ways to prove that:

- **HTTP check**: put a file on the website. This needs the app to run on
  the same server as the website, which is not the case here.
- **DNS check**: add a TXT record to the domain's DNS settings. This works
  from anywhere, and it is the only way to get wildcard certificates such
  as `*.example.com`.

MagiCertbot uses the DNS check for both reasons.
