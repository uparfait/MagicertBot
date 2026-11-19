import { show_form_error } from "./dom.js";
import { run_form } from "./run_task.js";
import { run_order_flow } from "./order_flow.js";

const form = document.getElementById("new_form");

// Reads the form and catches simple mistakes before anything is sent.
function read_form() {
  const data = Object.fromEntries(new FormData(form));
  const domains = data.domains.split(/[\s,;]+/).map((item) => item.trim().toLowerCase()).filter(Boolean);
  const email = data.email.trim();
  const country = data.country.trim();

  if (!domains.length) throw new Error("Please add at least one domain name, like example.com.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That email address does not look right.");
  if (country && !/^[a-z]{2}$/i.test(country)) throw new Error("The country code should be two letters, like US or GB.");

  return {
    start_body: { domains, email, staging: data.staging === "on" },
    finish_body: {
      key_type: data.key_type,
      details: { organization: data.organization, country, state: data.state, locality: data.city },
    },
  };
}

export function setup_new_certificate() {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let request = null;
    try {
      request = read_form();
    } catch (error) {
      show_form_error(form, error.message);
      return;
    }

    show_form_error(form, "");
    run_form(form, () => run_order_flow({
      panel: form.closest('[role="tabpanel"]'),
      start_url: "/api/certificate/start",
      ...request,
    }));
  });
}
