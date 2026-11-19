const dns = require("dns").promises;
const { make_friendly } = require("./errors");

// Local and private networks. We never connect to these.
const private_address = /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|::1$|::$|f[cd]|fe80:)/i;

// Looks up a host name and makes sure it points to the public internet.
async function find_public_address(host) {
  let address = "";
  try {
    ({ address } = await dns.lookup(host));
  } catch {
    throw make_friendly(`We could not find ${host}. Check the spelling, and that its DNS points to your server.`);
  }

  const plain = address.replace(/^::ffff:/i, "");
  if (private_address.test(plain)) throw make_friendly("We can only reach public websites.");
  return plain;
}

module.exports = { find_public_address };
