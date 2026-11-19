import { $, domain_ok, email_ok } from "./helpers.js";
import { settings, clean_domains } from "./new_state.js";
import { set_error } from "./form_tools.js";
import { find_repeat, repeat_message } from "./domain_repeat.js";

// Checks the form and returns the first field that needs fixing.
export function find_problem() {
  const domains = clean_domains();
  const problems = [];
  const add = (key, message, element) => { set_error(key, message); problems.push(element); };

  if (!domains.length) add("domains", "Please add at least one website address.", $("#domain_list input"));
  else {
    const wrong = domains.find((domain) => !domain_ok(domain));
    const repeat = find_repeat();
    if (wrong) add("domains", `"${wrong}" does not look like a website address. Try something like example.com`, $("#domain_list input"));
    else if (repeat) add("domains", repeat_message(repeat), $("#domain_list input"));
    else set_error("domains", "");
  }
  if (!settings.no_email && !email_ok(settings.email.trim())) add("email", "Please enter a valid email address.", $("#email"));
  if (settings.cert_name.trim() && !/^[a-z0-9][a-z0-9._-]{0,120}$/i.test(settings.cert_name.trim())) {
    add("cert_name", "Use only letters, numbers, dots, dashes and underscores.", $("#cert_name"));
  }
  if (settings.country.trim() && !/^[a-z]{2}$/i.test(settings.country.trim())) add("country", "Use a two letter code, like US or GB.", $("#country"));
  if (!settings.agree) add("agree", "Please agree to the terms to go on.", $('[data-key="agree"]'));
  return problems[0] || null;
}
