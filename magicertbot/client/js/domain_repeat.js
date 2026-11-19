import { clean_domain } from "./helpers.js";
import { settings } from "./new_state.js";
import { set_error } from "./form_tools.js";

// The first address typed more than once, or "" when there is none.
// Addresses are compared after cleaning, so "Example.com" and
// "https://example.com/" count as the same address.
export function find_repeat() {
  const seen = new Set();
  for (const domain of settings.domains.map(clean_domain).filter(Boolean)) {
    if (seen.has(domain)) return domain;
    seen.add(domain);
  }
  return "";
}

export const repeat_message = (domain) => `${domain} is already in the list. Each address only needs to be added once.`;

// Shows the message under the list straight away, or clears it.
export function show_repeat() {
  const repeat = find_repeat();
  set_error("domains", repeat ? repeat_message(repeat) : "");
}
