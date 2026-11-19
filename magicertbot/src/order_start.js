const acme = require("acme-client");
const { make_client, find_dns_challenge } = require("./acme_setup");

// Part one of getting a certificate, like "certbot certonly --manual
// --preferred-challenges dns": make an account, place an order and
// work out the TXT records that prove the domains are yours.
async function start_order({ domains, email, staging, key_pem = "" }, step) {
  step(10, "Getting ready");
  const account_key = (await acme.crypto.createPrivateEcdsaKey()).toString();
  const client = make_client({ staging, account_key });

  step(30, "Creating your Let's Encrypt account");
  await client.createAccount({
    termsOfServiceAgreed: true,
    contact: email ? [`mailto:${email}`] : [],
  });

  step(55, "Placing your certificate order");
  const order = await client.createOrder({
    identifiers: domains.map((value) => ({ type: "dns", value })),
  });

  step(75, "Preparing your DNS records");
  const authorizations = await client.getAuthorizations(order);
  const records = [];

  for (const authorization of authorizations) {
    if (authorization.status === "valid") continue;
    const challenge = find_dns_challenge(authorization);
    const domain = authorization.identifier.value;
    records.push({
      domain,
      name: `_acme-challenge.${domain}`,
      value: await client.getChallengeKeyAuthorization(challenge),
    });
  }

  step(95, "Almost there");
  return {
    domains,
    records,
    // Nothing is saved on our side. The browser keeps these details
    // and sends them back for part two.
    state: {
      staging: Boolean(staging),
      account_key,
      account_url: client.getAccountUrl(),
      order_url: order.url,
      key_pem,
    },
  };
}

module.exports = { start_order };
