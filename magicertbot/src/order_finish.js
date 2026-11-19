const { X509Certificate } = require("crypto");
const { make_client, check_state, find_dns_challenge } = require("./acme_setup");
const { make_signing_request } = require("./signing_request");
const { make_certificate_zip } = require("./zip_writer");
const { make_friendly } = require("./errors");

// Looks up the TXT record ourselves first. If it is not there yet,
// the order stays open and the person can simply try again later.
async function check_dns(client, authorization) {
  try {
    await client.verifyChallenge(authorization, find_dns_challenge(authorization));
  } catch {
    const domain = authorization.identifier.value;
    throw make_friendly(`We can't see the TXT record for ${domain} yet. New records can take a few minutes to show up. Please wait a little and check again.`);
  }
}

async function confirm_with_lets_encrypt(client, authorization) {
  const challenge = find_dns_challenge(authorization);
  await client.completeChallenge(challenge);
  await client.waitForValidStatus(challenge);
}

// Part two: prove the domains, sign the certificate and pack every file into one ZIP.
async function finish_order(body, step) {
  const state = check_state(body.state);
  const client = make_client(state);

  step(10, "Looking up your order");
  const order = await client.getOrder({ url: state.order_url });
  const domains = order.identifiers.map((item) => item.value);
  const waiting = (await client.getAuthorizations(order)).filter((item) => item.status === "pending");

  step(25, "Checking your DNS records");
  await Promise.all(waiting.map((item) => check_dns(client, item)));

  step(45, "Asking Let's Encrypt to confirm your domains");
  await Promise.all(waiting.map((item) => confirm_with_lets_encrypt(client, item)));

  step(65, state.key_pem ? "Using your private key" : "Creating your private key");
  const { private_key, csr } = await make_signing_request(domains, { ...body, key_pem: state.key_pem });

  step(80, "Signing your certificate");
  const signed_order = await client.finalizeOrder(order, csr);

  step(92, "Packing your files into a ZIP");
  const certificate = await client.getCertificate(signed_order);
  const valid_until = new Date(new X509Certificate(certificate).validTo).toISOString();
  const zip = make_certificate_zip({ certificate, private_key, csr, domains, valid_until, staging: state.staging });

  return { ...zip, domains, valid_until, staging: state.staging };
}

module.exports = { finish_order };
