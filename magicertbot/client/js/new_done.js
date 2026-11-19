import { $, esc, fmt_date, size_text, download_base64 } from "./helpers.js";
import { icon, gear, seal_icon } from "./icons.js";
import { show_view } from "./views.js";
import { settings } from "./new_state.js";
import { fill, update } from "./new_form.js";
import { render_domains } from "./domain_rows.js";
import { life_card, details_list, zip_contents_list, hero, found_from_names } from "./results.js";
import { mark_unsaved, mark_saved, leave_ok, download_warning } from "./zip_guard.js";

const plain_text = (info) => `This certificate keeps <strong>${info.domains.map(esc).join(", ")}</strong> safe with HTTPS until <strong>${fmt_date(info.to)}</strong>.
  Add <strong>fullchain.pem</strong> and <strong>privkey.pem</strong> to your web server settings. The README in the zip shows how.
  Come back and renew it here, with this zip, before it ends.`;

// The last step: the certificate is ready to download.
export function show_new_done(panel, result) {
  const out = $("[data-done]", panel);

  if (result.dry_run) {
    out.innerHTML = `${hero(`<span>${gear("still")}</span>`, "Your test run went well", "Everything is set up correctly. No certificate was kept.")}
      <p class="plain">Turn off <strong>Test run only</strong> in More options when you are ready to get your real certificate.</p>
      <div class="actions single"><button type="button" class="btn btn_outline" data-back="form">${icon("back")}Change settings</button></div>`;
    show_view(panel, "done");
    return;
  }

  const info = result.info;
  const what = `${info.domains.length === 1 ? esc(info.domains[0]) : `${info.domains.length} addresses`}${result.staging ? " – test certificate" : ""}`;

  out.innerHTML = `${hero(seal_icon(), "Your certificate is ready", what)}
    ${life_card(info)}
    <p class="plain">${plain_text(info)}</p>
    ${download_warning}
    <div class="actions">
      <button type="button" class="btn btn_primary" data-download>${icon("download")}Download zip</button>
      <button type="button" class="btn btn_outline" data-another>${icon("plus")}Make another</button>
    </div>
    <h3 class="section_title">What is in your zip</h3>
    <p class="hint" style="margin:0 0 4px">${esc(result.file_name)} – ${size_text(result.zip_size)}</p>
    ${zip_contents_list(found_from_names(result.included))}
    <h3 class="section_title">Certificate details</h3>
    ${details_list(info)}`;

  $("[data-download]", out).addEventListener("click", () => { download_base64(result.file_name, result.zip_base64); mark_saved(); });
  $("[data-another]", out).addEventListener("click", () => {
    if (!leave_ok()) return;
    Object.assign(settings, { domains: [""], cert_name: "", cert_name_touched: false, agree: false });
    render_domains(0);
    fill();
    update();
    show_view(panel, "form");
  });
  mark_unsaved();
  show_view(panel, "done");
}
