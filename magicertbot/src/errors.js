// Errors we create on purpose already have a clear message for people.
function make_friendly(message) {
  const error = new Error(message);
  error.is_friendly = true;
  return error;
}

// The name Let's Encrypt complained about, like "www.example.com".
const named = (text) => (text.match(/for "([^"]+)"/) || [])[1];

// Common problems from Let's Encrypt or the network, in plain words.
const known_problems = [
  [/forbidden by policy|policy forbids|rejectedIdentifier/i, (text) => `Let's Encrypt does not give certificates for ${named(text) ? `"${named(text)}"` : "this address"}. It is a blocked or reserved name, like example.com. Please use a real address that you own.`],
  [/rateLimited|too many/i, () => "Let's Encrypt has had too many requests for this address lately. Please wait a while and try again, or turn on the testing server."],
  [/caa/i, () => "Your domain has a CAA record that does not allow Let's Encrypt. Add letsencrypt.org to it and try again."],
  [/unauthorized|incorrect txt|no txt|nxdomain/i, () => "Let's Encrypt could not find your proof, so this request was closed. Please start again, and wait a few minutes after adding your proof."],
  [/status: invalid|order.*(invalid|expired)/i, () => "This request has expired or failed. Please start again from the first step."],
  [/ENOTFOUND|EAI_AGAIN/i, () => "We could not find that address. Check the spelling and try again."],
  [/ECONNREFUSED|ECONNRESET|ETIMEDOUT|ECONNABORTED|socket hang up/i, () => "We could not connect. Please check your internet connection and the address, then try again."],
];

// Let's Encrypt messages look like "Error creating new order :: <reason>".
function acme_reason(message) {
  const parts = String(message).split(" :: ");
  return parts.length > 1 ? parts.slice(1).join(" :: ").trim() : "";
}

// Always tells people what really happened, in the plainest words we have.
function friendly_error(error) {
  if (error && error.is_friendly) return error.message;

  console.error(error);
  const text = `${(error && error.code) || ""} ${(error && error.message) || ""}`.trim();
  const match = known_problems.find(([pattern]) => pattern.test(text));
  if (match) return match[1](text);

  const reason = acme_reason(error && error.message);
  if (reason) return `Let's Encrypt said: ${reason}`;
  return `This did not work: ${String((error && error.message) || "an unknown problem").slice(0, 300)}`;
}

module.exports = { make_friendly, friendly_error };
