import { $$, esc } from "./helpers.js";
import { icon, gear } from "./icons.js";

// The list of steps under the loader: grey dots for what comes next,
// a turning gear for the step running now, and a tick for finished ones.
export function render_steps(list, steps) {
  list.innerHTML = steps.map((step) => `<li><span class="dot"></span><span>${esc(step)}</span></li>`).join("");
}

export function mark_steps(list, current) {
  $$("li", list).forEach((item, index) => {
    const state = index < current ? "done" : index === current ? "now" : "";
    if (item.dataset.state === state) return;
    item.dataset.state = state;
    item.className = state;
    item.querySelector(".dot").innerHTML = state === "done" ? icon("check") : state === "now" ? gear() : "";
  });
}

// The step that failed gets a red alert sign instead of the gear.
export function mark_failed(list, current) {
  const item = list.children[current];
  if (!item) return;
  item.className = "failed";
  item.querySelector(".dot").innerHTML = icon("alert");
}
