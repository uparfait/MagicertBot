import { show_form_error } from "./dom.js";
import { read_zip } from "./files.js";
import { run_form, run_with_progress } from "./run_task.js";
import { show_details } from "./details_view.js";

const work_area = document.querySelector("#panel_check [data-work_area]");
const file_form = document.getElementById("check_file_form");
const domain_form = document.getElementById("check_domain_form");

// Gets the request ready, sends it with progress, then shows the details.
async function run_check(form, url, make_body, upload_text = "") {
  show_form_error(form, "");

  let body = null;
  try {
    body = await make_body();
  } catch (error) {
    show_form_error(form, error.message);
    return;
  }

  run_form(form, async () => {
    work_area.replaceChildren();
    const details = await run_with_progress(work_area, url, body, upload_text);
    show_details(work_area, details);
  });
}

export function setup_check_certificate() {
  file_form.addEventListener("submit", (event) => {
    event.preventDefault();
    run_check(file_form, "/api/check/file", async () => ({
      zip_base64: await read_zip(file_form.elements.zip_file),
    }), "Uploading your ZIP");
  });

  domain_form.addEventListener("submit", (event) => {
    event.preventDefault();
    run_check(domain_form, "/api/check/domain", async () => {
      const domain = domain_form.elements.domain.value.trim();
      if (!domain) throw new Error("Please type a website address, like example.com.");
      return { domain };
    });
  });
}
