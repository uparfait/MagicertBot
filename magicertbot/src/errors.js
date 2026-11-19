// Errors we create on purpose already have a clear message for people.
function make_friendly(message) {
  const error = new Error(message);
  error.is_friendly = true;
  return error;
}

// Common problems from Let's Encrypt or the network, in plain words.
const known_problems = [
  [/rateLimited|too many/i, "Let's Encrypt has had too many requests for this domain lately. Please wait a while and try again."],
  [/rejectedIdentifier|policy forbids|invalid identifier/i, "Let's Encrypt can't give a certificate for this domain. Check the spelling and make sure it's a public domain."],
  [/caa/i, "Your domain has a CAA record that does not allow Let's Encrypt. Add letsencrypt.org to it and try again."],
  [/unauthorized|incorrect txt|no txt|nxdomain/i, "Let's Encrypt could not find the right TXT record, so this request was closed. Please start again and wait a few minutes after adding the records."],
  [/status: invalid|order.*(invalid|expired)/i, "This request has expired or failed. Please start again from the first step."],
  [/ENOTFOUND|EAI_AGAIN/i, "We could not find that address. Check the spelling and try again."],
  [/ECONNREFUSED|ECONNRESET|ETIMEDOUT/i, "We could not connect. Please check the address and try again."],
];

function friendly_error(error) {
  if (error.is_friendly) return error.message;

  console.error(error);
  const text = `${error.code || ""} ${error.message || ""}`;
  const match = known_problems.find(([pattern]) => pattern.test(text));
  return match ? match[1] : "Something went wrong on our side. Please try again in a moment.";
}

module.exports = { make_friendly, friendly_error };
