# Proving the website is yours

Let's Encrypt only gives a certificate to someone who controls the
address. On the "Prove it's yours" step you pick one of two ways.

## Check file

Files: `client/js/proof_view.js`, `client/js/proof_collect.js`,
`src/proof_http.js`

1. Let's Encrypt gives each address a **unique ID** (called a token).
2. The page offers a small text file named after that ID. Its text is the
   ID plus a code made from your account key.
3. You put the file in the `/.well-known/acme-challenge/` folder of your
   website, so it opens at
   `http://your-address/.well-known/acme-challenge/<unique ID>`.
4. You paste that address back into the page.

Before anything is sent, the page checks the pasted address:

- it must be a full address that starts with `http://` or `https://`
- its domain must be **the same address you entered before**
- it must have no port number
- it must end with `/.well-known/acme-challenge/<unique ID>`

The server checks the same rules again, because a page can be changed.
Then it opens `http://your-address/.well-known/acme-challenge/<unique ID>`
itself, the same way Let's Encrypt will, follows up to five redirects, and
compares the text. Only when the text matches does it ask Let's Encrypt to
look.

Addresses that start with `*.` (wildcards) cannot use a check file. They
always use a DNS record.

## DNS record

Files: `client/js/proof_cards.js`, `src/proof_check.js`

1. The page shows a TXT record: the name `_acme-challenge.your-address`
   and a value made from your account key.
2. You add it in your DNS settings.
3. The server looks up the record first. If it is not there yet, it says
   so and you can try again later.

## Why we check before Let's Encrypt looks

If Let's Encrypt looks and fails, the whole order is closed and you must
start again. Checking first means a slow DNS update or a typo only costs
you one more click. The order stays open, and you can fix it and press
**Check and create certificate** again.

## Switching between the two

You can switch between "Check file" and "DNS record" at any time on the
prove step. Pasted addresses are kept when you switch back.
