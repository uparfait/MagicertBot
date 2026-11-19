import { $, days_left, fmt_date } from "./helpers.js";
import { show_view } from "./views.js";
import { start_order_flow } from "./order_flow.js";
import { key_settings_from } from "./new_choices.js";
import { life_card, hero } from "./results.js";
import { seal_icon } from "./icons.js";
import { renew, renew_before } from "./renew.js";
import { show_renew_done } from "./renew_done.js";

// Renews only when it is due, unless "Renew now" or "Test run only" is on.
export function run_renewal(drop) {
  const panel = $("#panel_renew");
  const left = days_left(renew.info.to);

  if (!renew.dry_run && !renew.force && left > renew_before) {
    $("[data-done]", panel).innerHTML = `${hero(seal_icon(), "No renewal needed yet", `Your certificate still has ${left} days left.`)}
      ${life_card(renew.info)}
      <p class="plain">We renew when a certificate has ${renew_before} days or less left, and this one ends on <strong>${fmt_date(renew.info.to)}</strong>. Go back and turn on <strong>Renew now, even if it is not due</strong> if you want a new one today.</p>`;
    show_view(panel, "done");
    return;
  }

  // A new key keeps the same type and strength as the current one.
  const settings = { ...key_settings_from(renew.info.key), cert_name: renew.info.name, is_renewal: true };
  start_order_flow({
    panel,
    start_url: "/api/certificate/renew",
    back_view: "upload",
    start_body: {
      zip_base64: renew.zip_base64,
      reuse_key: renew.reuse_key,
      dry_run: renew.dry_run,
      test_cert: Boolean(renew.report.test_cert),
    },
    upload_text: "Uploading your zip",
    finish_body: () => ({ settings }),
    on_done: (result) => show_renew_done(panel, result, drop),
  });
}
