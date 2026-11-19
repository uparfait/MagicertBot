const express = require("express");
const { stream_route } = require("../stream");
const { clean_domains, clean_email } = require("../validate");
const { start_order } = require("../order_start");
const { finish_order } = require("../order_finish");
const { read_certificate_zip } = require("../zip_reader");
const { read_certificates, read_domains, key_matches } = require("../cert_details");
const { make_friendly } = require("../errors");

const router = express.Router();

// Part one for a new certificate: the person types their domains.
router.post("/start", stream_route((body, step) => start_order({
  domains: clean_domains(body.domains),
  email: clean_email(body.email),
  staging: Boolean(body.staging),
}, step)));

// Part one for a renewal: the domains come from the uploaded ZIP.
// If the ZIP holds the private key, the new certificate keeps using it.
router.post("/renew", stream_route((body, step) => {
  step(4, "Opening your ZIP");
  const files = read_certificate_zip(body.zip_base64);
  const [certificate] = read_certificates(files.certificate_pem);

  if (files.key_pem && !key_matches(certificate, files.key_pem)) {
    throw make_friendly("The private key in your ZIP does not belong to this certificate. Remove it to get a new key, or add the right one.");
  }

  step(8, `Found ${read_domains(certificate).join(", ")}`);
  return start_order({
    domains: clean_domains(read_domains(certificate)),
    email: clean_email(body.email),
    staging: Boolean(body.staging),
    key_pem: files.key_pem,
  }, step);
}));

// Part two, shared by new certificates and renewals.
router.post("/finish", stream_route((body, step) => finish_order(body, step)));

module.exports = router;
