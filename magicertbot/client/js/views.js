import { $, $$ } from "./helpers.js";

// Each tab has a few views (like form, prove, work and done).
// Only one shows at a time, and its heading gets the focus.
export function show_view(panel, name) {
  $$(":scope > [data-view]", panel).forEach((view) => {
    view.hidden = view.dataset.view !== name;
  });

  const heading = $(`:scope > [data-view="${name}"] h2`, panel);
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Buttons with data-back="view" go back to that view.
export function setup_back() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-back]");
    if (button) show_view(button.closest(".panel"), button.dataset.back);
  });
}
