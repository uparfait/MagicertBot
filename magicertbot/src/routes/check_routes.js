const express = require("express");
const { stream_route } = require("../stream");
const { clean_host } = require("../validate");
const { read_certificate_zip } = require("../zip_reader");
const { build_report } = require("../cert_report");
const { fetch_site_certificate } = require("../site_certificate");
const { read_info } = require("../cert_details");

const router = express.Router();

// Reads every file in an uploaded zip and builds a report.
router.post("/file", stream_route((body, tracker) => {
  tracker.plan([
    "Opening your zip",
    "Looking for each certificate file",
    "Reading your certificate",
    "Checking the dates",
    "Checking that your private key matches",
    "Checking the full chain",
    "Writing your report",
  ]);

  tracker.at(0);
  const zip = read_certificate_zip(body.zip_base64);
  tracker.at(1);
  return build_report(zip, tracker);
}));

// Reads the certificate a live website is using right now.
router.post("/domain", stream_route(async (body, tracker) => {
  const host = clean_host(body.domain);
  tracker.plan([`Connecting to ${host}`, "Reading its certificate", "Writing your report"]);

  tracker.at(0);
  const site = await fetch_site_certificate(host);
  tracker.at(1);
  const info = read_info(site.certificate, host);
  tracker.at(2);
  return { host, info, trusted: site.trusted, trust_note: site.trust_note };
}));

module.exports = router;
