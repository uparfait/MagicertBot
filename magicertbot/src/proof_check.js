const { find_challenge, address_label } = require("./acme_setup");
const { check_http_file } = require("./proof_http");
const { make_friendly } = require("./errors");

// Looks up the TXT record ourselves first. If it is not there yet,
// the order stays open and the person can simply try again later.
async function check_dns_record(client, authorization, challenge) {
  try {
    await client.verifyChallenge(authorization, challenge);
  } catch {
    throw make_friendly(`We can't see the DNS record for ${address_label(authorization)} yet. New records can take a few minutes to show up. Please wait a little and try again.`);
  }
}

// Checks one address the way the person chose, before Let's Encrypt looks.
// Wildcard addresses can only be proven with a DNS record.
async function check_proof(client, authorization, choice = {}) {
  const label = address_label(authorization);
  if (choice.method === "http" && authorization.wildcard) {
    throw make_friendly(`${label} starts with *. so it can only be proven with a DNS record.`);
  }

  const method = choice.method === "http" ? "http-01" : "dns-01";
  const challenge = find_challenge(authorization, method);
  if (!challenge) throw make_friendly(`Let's Encrypt did not offer this kind of check for ${label}.`);

  if (method === "http-01") {
    const expected = await client.getChallengeKeyAuthorization(challenge);
    await check_http_file(authorization.identifier.value, challenge.token, expected, choice.url);
  } else {
    await check_dns_record(client, authorization, challenge);
  }
  return challenge;
}

// Tells Let's Encrypt to look now, and waits until it agrees.
async function confirm_proof(client, challenge) {
  await client.completeChallenge(challenge);
  await client.waitForValidStatus(challenge);
}

module.exports = { check_proof, confirm_proof };
