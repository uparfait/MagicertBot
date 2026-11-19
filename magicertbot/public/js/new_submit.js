import { $ } from "./helpers.js";
import { settings, clean_domains, server_settings } from "./new_state.js";
import { find_problem } from "./new_checks.js";
import { start_order_flow } from "./order_flow.js";
import { show_new_done } from "./new_done.js";

export function setup_new_submit() {
  const panel = $("#panel_new");
  $("#new_form").addEventListener("submit", (event) => {
    event.preventDefault();
    const problem = find_problem();
    if (problem) {
      if (problem.closest("details")) problem.closest("details").open = true;
      problem.focus();
      problem.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const snapshot = { ...settings, email: settings.email.trim() };
    const chosen = server_settings();
    start_order_flow({
      panel,
      start_url: "/api/certificate/start",
      back_view: "form",
      start_body: {
        domains: clean_domains(),
        email: snapshot.no_email ? "" : snapshot.email,
        test_cert: snapshot.test_cert,
        dry_run: snapshot.dry_run,
      },
      finish_body: () => ({ settings: chosen }),
      on_done: (result) => show_new_done(panel, result),
    });
  });
}
