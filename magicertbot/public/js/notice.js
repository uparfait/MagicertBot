import { $ } from "./helpers.js";

// The warning sign next to the main heading opens a short note about how
// we treat files. It closes again on a second click, Escape or a click elsewhere.
export function setup_notice() {
  const button = $(".notice_btn");
  const note = $("#privacy_note");
  if (!button || !note) return;

  const set_open = (is_open) => {
    note.hidden = !is_open;
    button.setAttribute("aria-expanded", String(is_open));
  };

  button.addEventListener("click", () => set_open(note.hidden));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !note.hidden) {
      set_open(false);
      button.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!note.hidden && !note.contains(event.target) && !button.contains(event.target)) set_open(false);
  });
}
