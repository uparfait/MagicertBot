import { $, $$ } from "./helpers.js";

// Shows or hides parts that depend on other settings.
// Example: data-show="key_type:rsa" shows only when RSA is picked.
export function apply_show(state, root) {
  $$("[data-show]", root).forEach((element) => {
    element.hidden = !element.dataset.show.split("&").every((rule) => {
      const [key, values] = rule.split(":");
      return values.split(",").includes(String(state[key]));
    });
  });
}

// Shows a message under a field and gives the field a red border.
export function set_error(key, message, root = document) {
  const box = $(`[data-error="${key}"]`, root);
  if (!box) return;
  box.textContent = message;
  box.closest(".field")?.classList.toggle("has_error", Boolean(message));
}
