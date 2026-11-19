import { $, $$ } from "./helpers.js";
import { settings, clean_domains } from "./new_state.js";
import { apply_show, set_error } from "./form_tools.js";
import { setup_domain_rows } from "./domain_rows.js";
import { setup_controls } from "./new_controls.js";

const bound_inputs = () => $$("#new_form [data-key]");

// Puts the settings back into the fields (for example after "Make another").
export function fill() {
  bound_inputs().forEach((element) => {
    const value = settings[element.dataset.key];
    if (element.type === "checkbox") element.checked = Boolean(value);
    else if (document.activeElement !== element) element.value = value ?? "";
  });
}

// Refreshes the parts that depend on the settings.
export function update() {
  if (!settings.cert_name_touched) {
    settings.cert_name = "";
    $("#cert_name").placeholder = (clean_domains()[0] || "example.com").replace(/^\*\./, "");
  }
  apply_show(settings, $("#panel_new"));
}

const read_value = (element) => (element.type === "checkbox" ? element.checked : element.value);

export function setup_new_form() {
  setup_controls(update);

  bound_inputs().forEach((element) => element.addEventListener(element.type === "checkbox" ? "change" : "input", () => {
    const key = element.dataset.key;
    settings[key] = read_value(element);
    if (key === "cert_name") settings.cert_name_touched = element.value.trim() !== "";
    set_error(key, "");
    update();
  }));

  setup_domain_rows(update);
  fill();
  update();
}
