const { make_client, check_state, address_label } = require("./acme_setup");
const { check_proof, confirm_proof } = require("./proof_check");
const { make_signing_request, key_label } = require("./signing_request");
const { make_certificate_zip } = require("./zip_writer");
const { read_info } = require("./cert_details");
const { open_state } = require("./sealed_state");

// Part two: check each address the way the person chose, let Let's Encrypt
// confirm it, sign the certificate and pack every file into one zip.
async function finish_order(body, tracker) {
  const state = check_state(open_state(body.state));
  const settings = body.settings || {};
  const proofs = body.proofs || {};
  const client = make_client(state);

  const order = await client.getOrder({ url: state.order_url });
  const waiting = (await client.getAuthorizations(order)).filter((item) => item.status === "pending");
  const domains = order.identifiers.map((item) => item.value);

  tracker.plan([
    "Looking up your order",
    ...waiting.map((item) => `Checking that you own ${address_label(item)}`),
    "Asking Let's Encrypt to confirm",
    state.key_pem ? "Using your current private key" : `Making your ${key_label(settings)} private key`,
    state.dry_run ? "Checking that a certificate could be made" : "Getting your certificate",
    state.dry_run ? null : "Packing your files into a zip",
  ]);
  tracker.at(0);

  const challenges = [];
  for (const [index, item] of waiting.entries()) {
    tracker.at(index + 1);
    challenges.push(await check_proof(client, item, proofs[address_label(item)]));
  }

  let step = waiting.length + 1;
  tracker.at(step++);
  await Promise.all(challenges.map((challenge) => confirm_proof(client, challenge)));

  tracker.at(step++);
  const { private_key, csr } = await make_signing_request(domains, settings, state.key_pem);

  tracker.at(step++);
  const signed_order = await client.finalizeOrder(order, csr);
  const certificate = await client.getCertificate(signed_order, settings.preferred_chain || null);
  const info = read_info(certificate, settings.cert_name);
  if (state.dry_run) return { dry_run: true, info };

  tracker.at(step);
  const zip = make_certificate_zip({ info, certificate, private_key, settings });
  return { ...zip, info, staging: state.staging };
}

module.exports = { finish_order };
