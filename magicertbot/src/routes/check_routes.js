const express = require("express");
const { stream_route } = require("../stream");
const { clean_host } = require("../validate");
const { read_certificate_zip } = require("../zip_reader");
const { fetch_site_certificate } = require("../site_certificate");
const { read_certificates, key_matches, describe_certificate } = require("../cert_details");

const router = express.Router();

// Check the certificate inside an uploaded ZIP file.
router.post("/file", stream_route(async (body, step) => {
  step(15, "Opening your ZIP");
  const files = read_certificate_zip(body.zip_base64);

  step(45, `Reading ${files.certificate_file}`);
  const certificates = read_certificates(files.certificate_pem);

  step(75, "Looking at the details");
  const extra = { source: files.certificate_file, chain_length: certificates.length };
  if (files.key_pem) extra.key_matches = key_matches(certificates[0], files.key_pem);
  return describe_certificate(certificates[0], extra);
}));

// Check the certificate a live website is using right now.
router.post("/domain", stream_route(async (body, step) => {
  const host = clean_host(body.domain);

  step(15, `Connecting to ${host}`);
  const site = await fetch_site_certificate(host);

  step(80, "Reading the certificate");
  return describe_certificate(site.certificate, {
    host,
    trusted: site.trusted,
    trust_note: site.trust_note,
  });
}));

module.exports = router;
