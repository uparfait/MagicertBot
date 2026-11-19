import { $ } from "./helpers.js";
import { show_view } from "./views.js";
import { run_with_loader } from "./run_task.js";
import { render_proof } from "./proof_view.js";
import { collect_proofs } from "./proof_collect.js";

// Getting a certificate has two parts with your proof in between:
// 1. Start: Let's Encrypt tells us what it needs to see.
// 2. Finish: we check your proof, Let's Encrypt confirms it and signs.
// There is no database, so the sealed order details travel with the page.
export async function start_order_flow({ panel, start_url, start_body, upload_text, back_view, finish_body, on_done }) {
  $("[data-prove_lead]", panel).textContent = "We are asking Let's Encrypt what it needs to see. This takes a few seconds.";
  $("[data-prove_body]", panel).innerHTML = '<div class="loader" data-start_loader></div>';
  show_view(panel, "prove");

  // On a failure the loader offers "Try again" and a way back to the settings.
  const order = await run_with_loader($("[data-start_loader]", panel), start_url, start_body, { upload_text, back_view, back_text: "Change settings" });

  render_proof(panel, order, async (method) => {
    const proofs = collect_proofs(panel, order, method);
    if (!proofs) return;

    show_view(panel, "work");
    const body = { ...finish_body(), state: order.state, proofs };
    const result = await run_with_loader($("[data-loader]", panel), "/api/certificate/finish", body, { back_view: "prove", back_text: "Back to your proof" });
    on_done(result);
  });
}
