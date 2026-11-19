const acme = require("acme-client");
const { make_client, find_challenge, address_label } = require("./acme_setup");
const { seal_state } = require("./sealed_state");

// For each address we prepare both ways to prove it is yours:
// a check file on the website, or a DNS record.
async function describe_proof(client, authorization) {
  const domain = authorization.identifier.value;
  const dns = find_challenge(authorization, "dns-01");
  const http = authorization.wildcard ? null : find_challenge(authorization, "http-01");
  const proof = { label: address_label(authorization), domain, wildcard: Boolean(authorization.wildcard) };

  if (dns) proof.dns = { name: `_acme-challenge.${domain}`, value: await client.getChallengeKeyAuthorization(dns) };
  if (http) {
    proof.http = {
      token: http.token,
      content: await client.getChallengeKeyAuthorization(http),
      url: `http://${domain}/.well-known/acme-challenge/${http.token}`,
    };
  }
  return proof;
}

// Part one: make an account, place an order and prepare the checks.
async function start_order({ domains, email, staging, dry_run = false, key_pem = "" }, tracker) {
  tracker.plan([
    "Getting ready",
    "Creating your Let's Encrypt account",
    "Placing your certificate order",
    "Preparing your ownership checks",
  ]);

  tracker.at(0);
  const account_key = (await acme.crypto.createPrivateEcdsaKey()).toString();
  const client = make_client({ staging, account_key });

  tracker.at(1);
  await client.createAccount({ termsOfServiceAgreed: true, contact: email ? [`mailto:${email}`] : [] });

  tracker.at(2);
  const order = await client.createOrder({ identifiers: domains.map((value) => ({ type: "dns", value })) });

  tracker.at(3);
  const waiting = (await client.getAuthorizations(order)).filter((item) => item.status === "pending");
  const proofs = await Promise.all(waiting.map((item) => describe_proof(client, item)));

  return {
    domains,
    proofs,
    // Nothing is saved on our side. The browser keeps these sealed
    // details and sends them back for part two.
    state: seal_state({
      staging: Boolean(staging), dry_run: Boolean(dry_run), account_key,
      account_url: client.getAccountUrl(), order_url: order.url, key_pem,
    }),
  };
}

module.exports = { start_order };
