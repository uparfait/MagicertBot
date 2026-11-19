const { make_friendly } = require("./errors");

// A domain like example.com, www.example.com or *.example.com.
const domain_pattern = /^(\*\.)?(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean_domains(list) {
  const items = (Array.isArray(list) ? list : []).map((item) => String(item).trim().toLowerCase().replace(/\.$/, "")).filter(Boolean);
  const repeat = items.find((item, index) => items.indexOf(item) !== index);
  if (repeat) throw make_friendly(`${repeat} is in the list more than once. Each address can only be added once.`);
  const domains = items;

  if (!domains.length) throw make_friendly("Please add at least one domain name, like example.com.");
  if (domains.length > 100) throw make_friendly("One certificate can cover up to 100 domain names.");

  const wrong = domains.find((domain) => !domain_pattern.test(domain));
  if (wrong) throw make_friendly(`"${wrong}" does not look like a domain name. Try something like example.com.`);
  return domains;
}

function clean_email(value) {
  const email = String(value || "").trim();
  if (email && !email_pattern.test(email)) throw make_friendly("That email address does not look right. Please check it.");
  return email;
}

// Accepts "example.com", "https://example.com/page" and similar, and keeps only the host name.
function clean_host(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) throw make_friendly("Please type a website address, like example.com.");

  let host = "";
  try {
    host = new URL(text.includes("://") ? text : `https://${text}`).hostname;
  } catch {
    host = "";
  }
  if (!domain_pattern.test(host) || host.startsWith("*.")) {
    throw make_friendly("That does not look like a website address. Try something like example.com.");
  }
  return host;
}

module.exports = { clean_domains, clean_email, clean_host };
