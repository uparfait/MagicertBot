const { find_public_address } = require("./net_safety");
const { make_friendly } = require("./errors");

// The pasted address must be on the same domain that was entered
// before, and must point to the check file itself.
function check_pasted_address(domain, token, pasted) {
  let address = null;
  try {
    address = new URL(String(pasted || "").trim());
  } catch {
    throw make_friendly(`Please paste the full address of the check file for ${domain}, starting with http://`);
  }

  const host = address.hostname.toLowerCase().replace(/\.$/, "");
  if (!["http:", "https:"].includes(address.protocol)) throw make_friendly("The address should start with http:// or https://");
  if (host !== domain) {
    throw make_friendly(`The address you pasted is on ${host}, but this check is for ${domain}. Please use an address on ${domain}.`);
  }
  if (address.port) throw make_friendly("Please use an address without a port number. Let's Encrypt only looks on the normal web port.");
  if (address.pathname !== `/.well-known/acme-challenge/${token}`) {
    throw make_friendly(`The address for ${domain} should end with /.well-known/acme-challenge/${token}`);
  }
}

// Opens an address and follows up to five redirects, checking each stop.
async function read_address(start) {
  let address = start;
  for (let hop = 0; hop < 5; hop += 1) {
    await find_public_address(new URL(address).hostname);
    const response = await fetch(address, { redirect: "manual", signal: AbortSignal.timeout(8000) });
    const next = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && next) {
      address = new URL(next, address).href;
      continue;
    }
    if (!response.ok) throw make_friendly(`Your website answered with error ${response.status} when we opened the check file.`);
    return (await response.text()).slice(0, 4000);
  }
  throw make_friendly("The check file address sends us to too many other addresses.");
}

// Opens the check file the same way Let's Encrypt will: on plain http.
async function check_http_file(domain, token, expected, pasted) {
  check_pasted_address(domain, token, pasted);

  let text = "";
  try {
    text = await read_address(`http://${domain}/.well-known/acme-challenge/${token}`);
  } catch (error) {
    if (error.is_friendly) throw error;
    throw make_friendly(`We could not open the check file on ${domain}. Make sure the site is online and port 80 is open.`);
  }

  if (text.trim() !== expected) {
    throw make_friendly(`We found a page on ${domain}, but it does not hold the check file text. Please upload the file again without changing it.`);
  }
}

module.exports = { check_http_file };
