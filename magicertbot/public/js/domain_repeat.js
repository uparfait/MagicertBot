import { $, $$, clean_domain } from "./helpers.js";
import { settings } from "./new_state.js";
import { set_error } from "./form_tools.js";

// The row that repeats an earlier address, or -1 when there is none.
// Addresses are compared after cleaning, so "Example.com" and
// "https://example.com/" count as the same address.
export function find_repeat_index() {
  const seen = new Set();
  for (const [index, typed] of settings.domains.entries()) {
    const domain = clean_domain(typed);
    if (!domain) continue;
    if (seen.has(domain)) return index;
    seen.add(domain);
  }
  return -1;
}

export function find_repeat() {
  const index = find_repeat_index();
  return index === -1 ? "" : clean_domain(settings.domains[index]);
}

export const repeat_message = (domain) => `${domain} is already in the list. Each address can only be added once, so please change or remove this one.`;

// Shows the message under the list and gives the repeated row a red border.
// Returns the repeated row's index, or -1.
export function show_repeat() {
  const index = find_repeat_index();
  set_error("domains", index === -1 ? "" : repeat_message(clean_domain(settings.domains[index])));
  // Only the repeated row turns red, not every row in the list.
  $("#domain_list").closest(".field").classList.remove("has_error");
  $$("[data-domain]").forEach((input) => input.closest(".input").classList.toggle("is_repeat", Number(input.dataset.domain) === index));
  return index;
}
