# MagicertBot

MagicertBot is a small website that creates, renews and checks free SSL
certificates from [Let's Encrypt](https://letsencrypt.org). Everything
happens on one page with three tabs:

- **New certificate**: type your website addresses, prove the site is
  yours with a check file or a DNS record, and download one zip.
- **Renew certificate**: upload that zip and get a fresh certificate for
  the same addresses.
- **Check certificate**: upload a zip or type a website address, and get
  a clear report.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd magicertbot
npm install
npm run make_key
```

Copy the printed `HANDSHAKE_PRIVATE_KEY=...` line into your environment,
then start the app:

```bash
npm start
```

Open <http://localhost:3000>. Use `npm run dev` to restart by itself when
you change a file. Without the key the app still runs, but it makes a new
temporary key each time it starts.

Turn on **Use the testing server** while you try things out. It uses the
Let's Encrypt practice server, so you will not hit their limits.

## Put it online with Vercel

See [docs/hosting_on_vercel.md](docs/hosting_on_vercel.md).

## Guides

| Guide | What it explains |
| --- | --- |
| [how_it_works.md](docs/how_it_works.md) | The big picture |
| [proving_ownership.md](docs/proving_ownership.md) | Check file or DNS record |
| [new_certificate.md](docs/new_certificate.md) | Each step of a new certificate |
| [renew_and_check.md](docs/renew_and_check.md) | Renewing and checking |
| [zip_files.md](docs/zip_files.md) | What goes in and out of the zip |
| [secure_requests.md](docs/secure_requests.md) | The key handshake and encryption |
| [progress.md](docs/progress.md) | The gear, the percent and the steps |
| [page_and_tabs.md](docs/page_and_tabs.md) | One page, three tabs, every address |
| [design.md](docs/design.md) | Colours, fields and screen sizes |
| [seo.md](docs/seo.md) | Helping search engines find the site |
| [safety.md](docs/safety.md) | Limits and checks that keep it safe |
| [project_layout.md](docs/project_layout.md) | What each file does |
