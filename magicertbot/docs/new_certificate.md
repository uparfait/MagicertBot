# Getting a new certificate

## Step 1: Your website

File: `client/parts/new_settings.html` and `client/js/new_form.js`

- **Website addresses** (required): one row per address. Press Enter or
  "Add another address" for a new row.
- **Email address** (required unless "Sign up without email" is on):
  Let's Encrypt uses it to reach you about your account.
- **Key type**: ECDSA (faster) or RSA (works everywhere), with its
  strength: P-256 or P-384, or 2048, 3072 or 4096 bits.
- **More options**:
  - Certificate name: the folder name inside your zip.
  - Preferred chain: the root your certificate should link to, for
    example `ISRG Root X1`. Empty means the default.
  - Use the testing server: the Let's Encrypt practice server.
  - Test run only: does every step on the practice server, but keeps no
    certificate.
  - Sign up without email.
  - Company details: added to the signing request only.
- **Terms** (required): you agree to the Let's Encrypt terms.

Required fields have a mauve `*`. The page checks everything before
moving on and puts the cursor on the first field that needs fixing.

## Step 2: Prove it's yours

File: `src/order_start.js`

The server makes a short-lived account key, creates a Let's Encrypt
account, places an order and prepares both proofs for each address. You
then pick a check file or a DNS record (see `proving_ownership.md`).

## Step 3: Creating your certificate

File: `src/order_finish.js`

1. Open the sealed order details and look up the order.
2. Check each address the way you chose.
3. Ask Let's Encrypt to confirm, and wait until it agrees.
4. Make the private key and the signing request (`src/signing_request.js`).
5. Send the signing request. Let's Encrypt signs the certificate.
6. Pack every file into one zip (see `zip_files.md`).

## Done

The page shows how many days the certificate has left, a short summary,
the files in the zip, and every detail of the certificate. **Download
zip** saves it, and **Make another** starts again with your settings.
