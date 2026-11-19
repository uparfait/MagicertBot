import { $, $$ } from "./helpers.js";
import { make_select } from "./select.js";
import { settings } from "./new_state.js";
import { curves, rsa_sizes, key_defaults, to_options } from "./new_choices.js";

// The key strength dropdowns of the New certificate form.
const selects = {};

function set_key_type(value, focus, update) {
  Object.assign(settings, { key_type: value }, key_defaults(value));
  selects.curve.set(settings.curve);
  selects.rsa_size.set(settings.rsa_size);
  $$('[data-segmented="key_type"] button').forEach((button) => {
    const is_on = button.dataset.value === value;
    button.setAttribute("aria-checked", String(is_on));
    button.tabIndex = is_on ? 0 : -1;
    if (is_on && focus) button.focus();
  });
  update();
}

// Builds the dropdowns and the ECDSA / RSA choice.
export function setup_controls(update) {
  const make = (key, choices, on_change) => make_select($(`[data-select="${key}"]`), key, to_options(choices), settings[key], on_change);
  selects.curve = make("curve", curves, (value) => { settings.curve = value; update(); });
  selects.rsa_size = make("rsa_size", rsa_sizes, (value) => { settings.rsa_size = value; update(); });

  const choices = $$('[data-segmented="key_type"] button');
  choices.forEach((button, index) => {
    button.addEventListener("click", () => set_key_type(button.dataset.value, false, update));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      set_key_type(choices[(index + 1) % choices.length].dataset.value, true, update);
    });
  });
  set_key_type("ecdsa", false, update);
}
