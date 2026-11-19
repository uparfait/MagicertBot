# Zip files

Everything goes in and out as one zip: one file to download, one file to
keep, and the same file to upload later.

## The zip you download

File: `src/zip_writer.js`

The server builds the zip in memory with
[adm-zip](https://github.com/cthackers/adm-zip). All files sit in one
folder named after the certificate:

| File | What it holds |
| --- | --- |
| `cert.pem` | Your certificate on its own |
| `chain.pem` | The middle certificate that links yours to a trusted root |
| `fullchain.pem` | Both together. Most web servers want this one |
| `privkey.pem` | Your private key. Keep it secret |
| `README.txt` | What each file is for and how to add them to Nginx or Apache |

The zip travels to the browser as base64 text inside the encrypted answer.
The browser turns it back into bytes and saves it when you press
**Download zip**. The file is named `<name>_certificate.zip`, or
`<name>_renewed.zip` after a renewal.

## Sending a zip to the server

File: `client/js/upload.js`

1. The page checks the name ends with `.zip` and that it is under 2 MB.
2. `FileReader` reads it as base64 text.
3. It goes inside an encrypted request, so the upload percent comes from
   the real upload.

## Reading a zip

File: `src/zip_reader.js`

1. Open the zip. If it is broken, say so in plain words.
2. Skip folders, Mac system files and files over 256 KB. Refuse zips with
   more than 30 files.
3. Find each file by its usual name: `cert.pem`, `chain.pem`,
   `fullchain.pem`, `privkey.pem` and any README.
4. If the names are different, find the certificate and the key by the
   text inside them.

So our own zip always works, and so does a zip you make yourself from
Certbot's `/etc/letsencrypt/live/<name>/` folder.
