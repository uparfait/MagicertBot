const express = require("express");
const { stream_route } = require("../stream");
const { clean_domains, clean_email } = require("../validate");
const { start_order } = require("../order_start");
const { finish_order } = require("../order_finish");

const router = express.Router();

// Part one for a new certificate: the person types their domains.
router.post("/start", stream_route((body, step) => start_order({
  domains: clean_domains(body.domains),
  email: clean_email(body.email),
  staging: Boolean(body.staging),
}, step)));

// Part two, shared by new certificates and renewals.
router.post("/finish", stream_route((body, step) => finish_order(body, step)));

module.exports = router;
