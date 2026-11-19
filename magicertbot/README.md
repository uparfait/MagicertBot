# MagiCertbot

MagiCertbot is a small website that gets, renews and checks free SSL
certificates from [Let's Encrypt](https://letsencrypt.org). Everything
happens on one page with three tabs:

- **New certificate**: type your domain names, add one DNS record, and
  download your certificate as a ZIP file.
- **Renew**: upload the ZIP you already have and get a fresh certificate
  for the same domains.
- **Check**: upload a ZIP or type a website address, and see every detail
  about the certificate.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd magicertbot
npm install
npm start
```

Then open <http://localhost:3000>. Use `npm run dev` if you want the
server to restart by itself when you change a file.

Tick **Test mode** while you try things out. It uses the Let's Encrypt
practice server, so you will not hit their limits. Browsers do not trust
test certificates.

## Put it online with Vercel

See [docs/hosting_on_vercel.md](docs/hosting_on_vercel.md).

## How it works

Each part of the app has its own short guide:

| Guide | What it explains |
| --- | --- |
| [how_it_works.md](docs/how_it_works.md) | The big picture and how it relates to certbot |
| [new_certificate.md](docs/new_certificate.md) | Getting a certificate with a DNS record |
| [zip_files.md](docs/zip_files.md) | How ZIP files are made and read |
| [renew_and_check.md](docs/renew_and_check.md) | Renewing and checking certificates |
| [progress.md](docs/progress.md) | The percent bar and the turning gear |
| [page_and_tabs.md](docs/page_and_tabs.md) | One page, three tabs, every address |
| [design.md](docs/design.md) | Colours, phone-first layout and form fields |
| [seo.md](docs/seo.md) | Helping search engines find the site |
| [safety.md](docs/safety.md) | How we keep keys and requests safe |
| [project_layout.md](docs/project_layout.md) | What each folder and file does |
