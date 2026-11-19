import { show_form_error } from "./dom.js";
import { read_zip } from "./files.js";
import { run_form } from "./run_task.js";
import { run_order_flow } from "./order_flow.js";

const form = document.getElementById("renew_form");

// Reads the ZIP and the other fields, and catches simple mistakes first.
async function read_form() {
  const email = form.elements.email.value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That email address does not look right.");

  return {
    zip_base64: await read_zip(form.elements.zip_file),
    email,
    staging: form.elements.staging.checked,
  };
}

export function setup_renew_certificate() {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    show_form_error(form, "");

    let start_body = null;
    try {
      start_body = await read_form();
    } catch (error) {
      show_form_error(form, error.message);
      return;
    }

    run_form(form, () => run_order_flow({
      panel: form.closest('[role="tabpanel"]'),
      start_url: "/api/certificate/renew",
      start_body,
      finish_body: { key_type: "rsa" },
      upload_text: "Uploading your ZIP",
    }));
  });
}
