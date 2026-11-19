# Project layout

```
magicertbot/
├── api/index.js          Vercel starts here and hands over to Express
├── server.js             Starts the app on your own computer
├── scripts/make_key.js   Makes the handshake key
├── vercel.json           Vercel settings
├── src/                  Server code
│   ├── app.js, page.js, seo_routes.js   The app, the page, SEO files
│   ├── payload.js, handshake.js         Encrypted requests
│   ├── sealed_state.js                  Sealed order details
│   ├── stream.js, errors.js             Progress lines, friendly errors
│   ├── validate.js, net_safety.js       Input checks, public addresses
│   ├── acme_setup.js                    Talks to Let's Encrypt
│   ├── order_start.js, order_finish.js  The two parts of an order
│   ├── proof_check.js, proof_http.js    DNS record and check file tests
│   ├── signing_request.js               Private key and CSR
│   ├── zip_writer.js, readme_writer.js  The zip you download
│   ├── zip_reader.js, cert_report.js    Reading and reporting on a zip
│   ├── cert_details.js, cert_names.js   Reading a certificate
│   ├── site_certificate.js              Reading a live website
│   └── routes/                          certificate and check routes
├── views/                The page in small HTML parts (server only)
├── public/               Everything the browser loads
│   ├── css/              base, layout, fields, controls, switches,
│   │                     buttons, loader, results and proof styles
│   ├── js/               Browser code (see below)
│   └── images/icon.svg   Logo and favicon
└── docs/                 These guides
```

## Browser code (`public/js/`)

| Group | Files |
| --- | --- |
| Start and shared | `main.js`, `helpers.js`, `icons.js`, `views.js`, `tabs.js` |
| Requests | `secure_channel.js`, `request.js`, `run_task.js` |
| Gear loader | `loader.js`, `loader_steps.js` |
| Form parts | `select.js`, `form_tools.js`, `domain_rows.js` |
| New certificate | `new_state.js`, `new_choices.js`, `new_controls.js`, `new_form.js`, `new_checks.js`, `new_submit.js`, `new_done.js` |
| Proving ownership | `order_flow.js`, `proof_view.js`, `proof_cards.js`, `proof_collect.js` |
| Upload | `upload.js`, `drop_markup.js` |
| Renew | `renew.js`, `renew_run.js`, `renew_done.js` |
| Check | `check.js`, `check_report.js`, `check_plain.js`, `site_report.js` |
| Results | `results.js` |
