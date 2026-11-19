import { create_element } from "./dom.js";

// A gear drawn from a dashed ring (the teeth) around a solid centre.
const gear_svg = `
<svg class="progress_gear" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="3.14 3.14"/>
  <circle cx="12" cy="12" r="6.5" fill="currentColor"/>
  <circle cx="12" cy="12" r="2.5" fill="#ffffff"/>
</svg>`;

// Shows a turning gear, a short note about the current step,
// the percent done and a bar that fills up.
export function create_progress(container) {
  const label = create_element("span", { class_name: "progress_label", attributes: { "aria-live": "polite" } });
  const value = create_element("span", { class_name: "progress_value", text: "0%" });
  const fill = create_element("span", { class_name: "progress_fill" });
  const bar = create_element("div", {
    class_name: "progress_bar",
    attributes: { role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" },
  }, [fill]);

  const top = create_element("div", { class_name: "progress_top" }, [label, value]);
  top.insertAdjacentHTML("afterbegin", gear_svg);
  const box = create_element("div", { class_name: "card progress" }, [top, bar]);
  container.append(box);

  let current = 0;

  const update = (percent, text) => {
    // The bar never moves backwards, so it always feels like progress.
    current = Math.max(current, Math.min(100, Math.round(percent)));
    fill.style.width = `${current}%`;
    value.textContent = `${current}%`;
    bar.setAttribute("aria-valuenow", String(current));
    if (text) label.textContent = text;
  };

  return {
    update,
    finish(text) {
      update(100, text);
      box.classList.add("is_done");
    },
    fail(text) {
      box.classList.add("is_failed");
      label.textContent = text;
      value.textContent = "Stopped";
    },
    remove: () => box.remove(),
  };
}
