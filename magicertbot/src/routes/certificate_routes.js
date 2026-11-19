const express = require("express");
const { stream_route } = require("../stream");
const { clean_domains, clean_email } = require("../validate");
const { start_order } = require("../order_start");
const { finish_order } = require("../order_finish");
const { read_certificate_zip } = require("../zip_reader");
const { read_certificates, read_domains, key_matches } = require("../cert_details");
const { make_friendly } = require("../errors");

const router = express.Router();

// Part one for a new certificate: the addresses come from the form.
router.post("/start", stream_route((body, tracker) => start_order({
  domains: clean_domains(body.domains),
  email: clean_email(body.email),
  staging: Boolean(body.test_cert || body.dry_run),
  dry_run: Boolean(body.dry_run),
}, tracker)));

// Part one for a renewal: the addresses come from the certificate in the zip.
// With "keep the same private key", the key in the zip must match.
router.post("/renew", stream_route((body, tracker) => {
  const zip = read_certificate_zip(body.zip_base64);
  const main = zip.cert || zip.fullchain;
  if (!main || !zip.privkey) throw make_friendly("This zip needs both your certificate and privkey.pem to renew.");

  const [certificate] = read_certificates(main.text);
  if (body.reuse_key && !key_matches(certificate, zip.privkey.text)) {
    throw make_friendly("The private key in your zip does not belong to this certificate, so it can't be kept. Turn off \"Keep the same private key\" to get a new one.");
  }

  return start_order({
    domains: clean_domains(read_domains(certificate)),
    email: "",
    staging: Boolean(body.test_cert || body.dry_run),
    dry_run: Boolean(body.dry_run),
    key_pem: body.reuse_key ? zip.privkey.text : "",
  }, tracker);
}));

// Part two, shared by new certificates and renewals.
router.post("/finish", stream_route((body, tracker) => finish_order(body, tracker)));

module.exports = router;
