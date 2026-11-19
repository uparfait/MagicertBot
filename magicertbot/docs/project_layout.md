# Project layout

```
magicertbot/
├── api/index.js             Vercel starts here and hands over to Express
├── server.js                Starts the app on your own computer
├── vercel.json              Vercel settings
├── package.json             Packages and scripts
├── src/                     Server code
│   ├── app.js               Express setup, routes and the catch-all page
│   ├── page.js              Joins the page parts and fills in each tab
│   ├── seo_routes.js        robots.txt and sitemap.xml
│   ├── stream.js            Sends progress updates line by line
│   ├── errors.js            Turns errors into plain, friendly words
│   ├── validate.js          Checks domains, emails and website addresses
│   ├── acme_setup.js        Connects to Let's Encrypt, checks the state
│   ├── order_start.js       Part one: account, order and DNS records
│   ├── order_finish.js      Part two: check, sign, download and pack
│   ├── signing_request.js   Makes the private key and signing request
│   ├── zip_writer.js        Packs the certificate files into a ZIP
│   ├── zip_reader.js        Finds the certificate and key in a ZIP
│   ├── cert_details.js      Reads every detail from a certificate
│   ├── site_certificate.js  Reads the certificate of a live website
│   └── routes/
│       ├── certificate_routes.js   start, renew and finish
│       └── check_routes.js         check a ZIP or a website
├── client/                  Everything the browser loads
│   ├── parts/               The page, split into small HTML parts
│   ├── css/                 base, layout, tabs, forms, buttons,
│   │                        progress and results styles
│   ├── js/                  Browser code (see below)
│   ├── images/icon.svg      Logo and favicon
│   └── site.webmanifest     App name, colours and icon
└── docs/                    These guides
```

## Browser code (`client/js/`)

| File | What it does |
| --- | --- |
| `main.js` | Starts every part of the page |
| `tabs.js` | The three tabs and their addresses |
| `dom.js` | Small helpers to build elements, copy and download |
| `files.js` | Drop zones and reading ZIP files |
| `request.js` | Sends requests and reads progress lines |
| `progress.js` | The gear, percent and bar |
| `run_task.js` | Runs a request with progress and locks the form |
| `order_flow.js` | The two parts of getting a certificate |
| `dns_records.js` | Shows the TXT records with copy buttons |
| `certificate_result.js` | Shows the finished certificate and downloads it |
| `new_certificate.js` | The New certificate form |
| `renew_certificate.js` | The Renew form |
| `check_certificate.js` | The two Check forms |
| `details_view.js` | Shows certificate details |
