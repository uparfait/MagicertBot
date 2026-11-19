# ZIP files

All files go in and out as ZIP files. This keeps things tidy: one file to
download, one file to keep, and the same file to upload later.

## Making the download ZIP

File: `src/zip_writer.js`

When a certificate is ready, the server builds a ZIP in memory with the
[adm-zip](https://github.com/cthackers/adm-zip) library:

| File | What it holds |
| --- | --- |
| `fullchain.pem` | Your certificate plus the chain. Most servers want this. |
| `privkey.pem` | Your private key. Keep it secret. |
| `cert.pem` | Only your certificate. |
| `chain.pem` | The Let's Encrypt certificates that link yours to a trusted root. |
| `request.csr` | The signing request. |
| `README.txt` | A short note with the domains and the end date. |

The ZIP is turned into **base64** text so it fits inside the JSON answer.
The browser turns it back into bytes, wraps it in a `Blob`, and clicks a
hidden download link. The download starts by itself, and a button lets you
download it again.

## Sending a ZIP to the server

File: `client/js/files.js`

1. The browser checks the file name ends with `.zip` and that it is
   smaller than 2 MB.
2. `FileReader.readAsDataURL` reads the file as base64 text.
3. The text is sent inside JSON, so every route works the same way.

## Reading an uploaded ZIP

File: `src/zip_reader.js`

1. Open the ZIP. If it is broken, say so in plain words.
2. Skip folders, Mac system files and any file bigger than 256 KB.
   Refuse ZIPs with more than 30 files.
3. Find the **certificate**: any file that contains
   `-----BEGIN CERTIFICATE-----`. If there are several, `fullchain.pem`
   wins, then `cert.pem`, then anything else. `chain.pem` comes last,
   because it holds Let's Encrypt's certificates, not yours.
4. Find the **private key**: any file that contains `PRIVATE KEY-----`,
   with `privkey.pem` first.

Because of this, the ZIP from our own download always works, and so does a
ZIP you make yourself from certbot's `/etc/letsencrypt/live/` folder.
