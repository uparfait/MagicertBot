import { $, $$, esc, days_left } from "./helpers.js";
import { send_request } from "./request.js";
import { setup_drop } from "./upload.js";
import { life_card, zip_contents_list } from "./results.js";
import { run_renewal } from "./renew_run.js";

// A certificate is due for renewal when 30 days or less are left.
export const renew_before = 30;

// Everything the Renew tab knows about the uploaded certificate.
export const renew = { zip_base64: "", report: null, info: null, force: false, reuse_key: false, dry_run: false };

function update_button() {
  $("#renew_button").textContent = renew.dry_run ? "Next: prove it's yours (test run)" : "Next: prove it's yours";
}

function show_found(report) {
  const left = days_left(report.info.to);
  const due = left <= renew_before;
  $("#renew_found").innerHTML = `<h3 class="section_title">We found your certificate</h3>
    ${life_card(report.info)}
    <p class="plain">This certificate covers <strong>${report.info.domains.map(esc).join(", ")}</strong>.
    ${due ? `It is due for renewal because it has ${Math.max(left, 0)} days left.` : `It is not due yet. We would normally wait until ${renew_before} days before it ends. Turn on <strong>Renew now</strong> below to renew it anyway.`}</p>
    ${zip_contents_list(report.found)}`;
}

// Reads the uploaded zip on the server, then shows what we found.
async function take_zip({ zip_base64, on_upload }) {
  $("#renew_setup").hidden = true;
  const report = await send_request("/api/check/file", { zip_base64 }, { on_upload });
  const missing = [];
  if (!report.found.cert && !report.found.fullchain) missing.push("cert.pem or fullchain.pem");
  if (!report.found.privkey) missing.push("privkey.pem");
  if (missing.length) throw new Error(`This zip is missing ${missing.join(" and ")}. Both are needed to renew.`);
  if (!report.readable) throw new Error("We could not read the certificate in this zip. Please choose the zip you downloaded from MagicertBot.");

  Object.assign(renew, { zip_base64, report, info: report.info, force: false, reuse_key: false, dry_run: false });
  $$("[data-renew_key]").forEach((element) => { element.checked = false; });
  show_found(report);
  update_button();
  $("#renew_setup").hidden = false;
}

export function setup_renew() {
  const slot = $('[data-drop="renew"]');
  const drop = setup_drop(slot, "Upload your certificate zip", take_zip);
  slot.addEventListener("drop_reset", () => { $("#renew_setup").hidden = true; });

  $$("[data-renew_key]").forEach((element) => element.addEventListener("change", () => {
    renew[element.dataset.renew_key] = element.checked;
    update_button();
  }));
  $("#renew_button").addEventListener("click", () => run_renewal(drop));
}
