const acme = require("acme-client");
const { make_friendly } = require("./errors");

// acme-client speaks ACME, the same language Certbot uses
// to talk to Let's Encrypt.
function pick_directory(staging) {
  const servers = acme.directory.letsencrypt;
  return staging ? servers.staging : servers.production;
}

function make_client({ staging, account_key, account_url = null }) {
  return new acme.Client({
    directoryUrl: pick_directory(staging),
    accountKey: account_key,
    accountUrl: account_url,
    backoffAttempts: 5,
    backoffMin: 1000,
    backoffMax: 4000,
  });
}

// The order details come back from the browser, so we make sure they
// still point to Let's Encrypt and nowhere else.
function check_state(state) {
  if (!state || !state.account_key || !state.order_url || !state.account_url) {
    throw make_friendly("Some details of this request are missing. Please start again.");
  }

  const expected_host = new URL(pick_directory(state.staging)).host;
  const is_safe = [state.order_url, state.account_url].every((address) => {
    try {
      return new URL(address).host === expected_host;
    } catch {
      return false;
    }
  });

  if (!is_safe) throw make_friendly("This request does not look right. Please start again.");
  return state;
}

// "http-01" is the check file, "dns-01" is the DNS record.
function find_challenge(authorization, type) {
  return authorization.challenges.find((item) => item.type === type) || null;
}

// A readable name for an address, with *. in front for wildcards.
const address_label = (authorization) => `${authorization.wildcard ? "*." : ""}${authorization.identifier.value}`;

module.exports = { make_client, check_state, find_challenge, address_label };
