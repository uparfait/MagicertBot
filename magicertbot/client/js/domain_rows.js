import { $, esc } from "./helpers.js";
import { icon } from "./icons.js";
import { settings } from "./new_state.js";
import { show_repeat } from "./domain_repeat.js";

const list = () => $("#domain_list");

// One row per address, with a remove button when there is more than one.
export function render_domains(focus_index) {
  list().innerHTML = settings.domains.map((domain, index) => `
    <div class="domain_row">
      <div class="input">${icon("globe")}
        <input type="text" value="${esc(domain)}" data-domain="${index}" placeholder="${index ? "www.example.com" : "example.com"}"
          aria-label="Website address ${index + 1}"${index ? "" : ' aria-required="true"'} inputmode="url" autocomplete="off" spellcheck="false">
      </div>
      ${settings.domains.length > 1 ? `<button type="button" class="icon_btn" data-remove="${index}" aria-label="Remove address ${index + 1}">${icon("x")}</button>` : ""}
    </div>`).join("");
  if (focus_index != null) list().querySelector(`[data-domain="${focus_index}"]`)?.focus();
}

export function setup_domain_rows(on_change) {
  const add_domain = () => {
    // An empty row is still waiting, so we go there instead of adding another.
    const empty = settings.domains.findIndex((domain) => !domain.trim());
    if (empty !== -1) return list().querySelector(`[data-domain="${empty}"]`).focus();
    if (settings.domains.length >= 100) return;
    settings.domains.push("");
    render_domains(settings.domains.length - 1);
    on_change();
  };

  list().addEventListener("input", (event) => {
    const index = event.target.dataset.domain;
    if (index == null) return;
    settings.domains[Number(index)] = event.target.value;
    show_repeat();
    on_change();
  });
  // Enter in an address adds a new row, like a list.
  list().addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.dataset.domain != null) {
      event.preventDefault();
      add_domain();
    }
  });
  list().addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button) return;
    const index = Number(button.dataset.remove);
    settings.domains.splice(index, 1);
    render_domains(Math.max(0, index - 1));
    show_repeat();
    on_change();
  });
  $("#add_domain").addEventListener("click", add_domain);
  render_domains();
}
