import { $, clean_domain, domain_ok } from "./helpers.js";
import { show_view } from "./views.js";
import { send_request } from "./request.js";
import { create_loader } from "./loader.js";
import { run_with_loader } from "./run_task.js";
import { setup_drop } from "./upload.js";
import { set_error } from "./form_tools.js";
import { report_html } from "./check_report.js";
import { site_report_html } from "./site_report.js";

const panel = () => $("#panel_check");
// The zip uploads with a percent in the drop area, then the server's
// steps show in the gear loader, then the report.
async function check_zip({ zip_base64, on_upload }) {
  let loader = null;
  try {
    const report = await send_request("/api/check/file", { zip_base64 }, {
      on_upload,
      on_plan: (steps) => {
        $("[data-work_lead]", panel()).textContent = "We are reading each file in your zip.";
        show_view(panel(), "work");
        loader = create_loader($("[data-loader]", panel()));
        loader.plan(steps);
      },
      on_progress: (message) => loader?.at(message.index, message.text),
    });
    if (loader) await loader.finish();
    $("[data-report]", panel()).innerHTML = report_html(report);
    show_view(panel(), "report");
  } catch (error) {
    show_view(panel(), "upload");
    throw error;
  }
}

async function check_site(event) {
  event.preventDefault();
  const host = clean_domain($("#site_address").value);
  if (!host) return set_error("site_address", "Please type a website address, like example.com.");
  if (!domain_ok(host) || host.startsWith("*.")) return set_error("site_address", `"${host}" does not look like a website address. Try something like example.com`);
  set_error("site_address", "");
  $("[data-work_lead]", panel()).textContent = `We are connecting to ${host}.`;
  show_view(panel(), "work");
  try {
    const result = await run_with_loader($("[data-loader]", panel()), "/api/check/domain", { domain: host });
    $("[data-report]", panel()).innerHTML = site_report_html(result);
    show_view(panel(), "report");
  } catch (error) {
    setTimeout(() => {
      show_view(panel(), "upload");
      set_error("site_address", error.message);
    }, 1200);
  }
}

export function setup_check() {
  setup_drop($('[data-drop="check"]'), "Upload your certificate zip", check_zip);
  $("#site_form").addEventListener("submit", check_site);
  $("#site_address").addEventListener("input", () => set_error("site_address", ""));
}
