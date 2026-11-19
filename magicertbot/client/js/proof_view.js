import { $, $$, download_blob } from "./helpers.js";
import { http_card, dns_card, http_checklist, dns_note } from "./proof_cards.js";
import { check_address } from "./proof_collect.js";

const leads = {
  http: "Download the check file for each address and put it on your website. Then paste the address where it opens, so we can make sure it works before Let's Encrypt looks.",
  dns: "Add the DNS record below in your DNS settings. Let's Encrypt reads it to confirm the website is yours.",
};

const method_picker = (method) => `<div class="field method_pick"><span class="label" id="method_label">How do you want to prove it?</span>
  <div class="segmented" role="radiogroup" aria-labelledby="method_label">
    <button type="button" role="radio" data-method="http" aria-checked="${method === "http"}">Check file <small>– on your website</small></button>
    <button type="button" role="radio" data-method="dns" aria-checked="${method === "dns"}">DNS record <small>– in your DNS</small></button>
  </div></div>`;

// Shows the prove step. People choose a check file or a DNS record.
// Addresses that start with *. always use a DNS record.
export function render_proof(panel, order, on_create) {
  const can_use_file = order.proofs.some((proof) => proof.http);
  let method = can_use_file ? "http" : "dns";
  const typed = {};

  const draw = () => {
    $$("[data-proof_url]", panel).forEach((input) => { typed[input.dataset.proof_url] = input.value; });
    const use_file = (proof) => method === "http" && proof.http;
    const cards = order.proofs.map((proof, index) => (use_file(proof) ? http_card(proof, index) : dns_card(proof))).join("");
    const needs_dns_note = order.proofs.some((proof) => !use_file(proof));

    $("[data-prove_lead]", panel).textContent = leads[method];
    $("[data-prove_body]", panel).innerHTML = `${can_use_file ? method_picker(method) : ""}${method === "http" ? http_checklist() : ""}${cards}${needs_dns_note ? dns_note() : ""}
      <div class="actions single"><button type="button" class="btn btn_primary" data-create>Check and create certificate</button></div>`;

    $$("[data-proof_url]", panel).forEach((input) => {
      input.value = typed[input.dataset.proof_url] || "";
      input.addEventListener("change", () => {
        const message = input.value ? check_address(input.value, order.proofs[Number(input.dataset.proof_url)]) : "";
        $(`[data-proof_error="${input.dataset.proof_url}"]`, panel).textContent = message;
        input.closest(".field").classList.toggle("has_error", Boolean(message));
      });
    });
    $$("[data-method]", panel).forEach((button) => button.addEventListener("click", () => { method = button.dataset.method; draw(); }));
    $$("[data-download_proof]", panel).forEach((button) => button.addEventListener("click", () => {
      const proof = order.proofs[Number(button.dataset.download_proof)];
      download_blob(new Blob([proof.http.content], { type: "application/octet-stream" }), proof.http.token);
    }));
    $("[data-create]", panel).addEventListener("click", () => on_create(method));
  };
  draw();
}
