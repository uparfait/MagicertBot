import { $, esc, fmt_date, size_text, download_base64 } from "./helpers.js";
import { icon, gear, seal_icon } from "./icons.js";
import { show_view } from "./views.js";
import { life_card, details_list, zip_contents_list, hero, found_from_names } from "./results.js";
import { renew } from "./renew.js";
import { mark_unsaved, mark_saved, leave_ok, download_warning } from "./zip_guard.js";

// The renewed certificate, ready to download.
export function show_renew_done(panel, result, drop) {
  const out = $("[data-done]", panel);

  if (result.dry_run) {
    out.innerHTML = `${hero(`<span>${gear("still")}</span>`, "Your test run went well", "Renewing will work. No certificate was kept.")}
      <p class="plain">Turn off <strong>Test run only</strong> when you want to renew for real.</p>`;
    show_view(panel, "done");
    return;
  }

  const info = result.info;
  const key_text = renew.reuse_key
    ? "It still uses your current private key."
    : "It comes with a new private key, so replace both files on your server.";

  out.innerHTML = `${hero(seal_icon(), "Your certificate is renewed", esc(info.domains.join(", ")))}
    ${life_card(info)}
    <p class="plain">It used to end on <strong>${fmt_date(renew.info.to)}</strong>. It now ends on <strong>${fmt_date(info.to)}</strong>. ${key_text}</p>
    ${download_warning}
    <div class="actions">
      <button type="button" class="btn btn_primary" data-download>${icon("download")}Download new zip</button>
      <button type="button" class="btn btn_outline" data-another>${icon("upload")}Renew another</button>
    </div>
    <h3 class="section_title">What is in your zip</h3>
    <p class="hint" style="margin:0 0 4px">${esc(result.file_name)} – ${size_text(result.zip_size)}</p>
    ${zip_contents_list(found_from_names(result.included))}
    <h3 class="section_title">New certificate details</h3>
    ${details_list(info)}`;

  $("[data-download]", out).addEventListener("click", () => { download_base64(result.file_name, result.zip_base64); mark_saved(); });
  $("[data-another]", out).addEventListener("click", () => {
    if (!leave_ok()) return;
    drop.reset();
    $("#renew_setup").hidden = true;
    show_view(panel, "upload");
  });
  mark_unsaved();
  show_view(panel, "done");
}
