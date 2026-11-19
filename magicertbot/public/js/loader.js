import { $ } from "./helpers.js";
import { gear } from "./icons.js";
import { render_steps, mark_steps, mark_failed } from "./loader_steps.js";

// The gear loader: a big percent, a short note, a bar and the list of
// steps the server is working through. The first part of the bar can
// follow an upload (upload_share), the rest follows the server's steps.
export function create_loader(box, upload_share = 0) {
  box.classList.remove("failed");
  box.innerHTML = `${gear()}<div class="loader_pct" aria-hidden="true">0%</div><p class="loader_label" role="status" aria-live="polite">Getting ready</p><div class="bar" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><ol class="loader_steps"></ol>`;
  const [pct, label, bar, fill, list] = [".loader_pct", ".loader_label", ".bar", ".bar span", ".loader_steps"].map((selector) => $(selector, box));
  const view = { steps: [], current: -1, shown: 0, target: 0, ceiling: 0, running: true, when_full: null };

  // Moves smoothly toward the target, and creeps slowly inside a long step.
  const paint = () => {
    if (view.shown < view.target) view.shown = Math.min(view.target, view.shown + Math.max(0.5, (view.target - view.shown) * 0.12));
    else if (view.shown < view.ceiling - 2) view.shown += 0.03;
    pct.textContent = `${Math.floor(view.shown)}%`;
    fill.style.width = `${view.shown}%`;
    bar.setAttribute("aria-valuenow", String(Math.floor(view.shown)));
    if (view.when_full && view.shown >= 100) view.when_full();
    else if (view.running) requestAnimationFrame(paint);
  };
  requestAnimationFrame(paint);
  const place = (from, to, text) => {
    view.target = upload_share + (from / 100) * (100 - upload_share);
    view.ceiling = upload_share + (to / 100) * (100 - upload_share);
    if (text) label.textContent = text;
  };

  return {
    upload(percent, text) {
      view.target = (percent / 100) * upload_share;
      view.ceiling = view.target;
      label.textContent = text;
    },
    plan(steps) {
      view.steps = steps;
      render_steps(list, steps);
      mark_steps(list, view.current);
    },
    at(index, text) {
      view.current = index;
      place((index / view.steps.length) * 100, ((index + 1) / view.steps.length) * 100, text || view.steps[index]);
      mark_steps(list, index);
    },
    finish(text = "All done") {
      view.current = view.steps.length;
      place(100, 100, text);
      mark_steps(list, view.current);
      return new Promise((resolve) => { view.when_full = () => { view.running = false; setTimeout(resolve, 350); }; });
    },
    fail(message) {
      view.running = false;
      box.classList.add("failed");
      label.textContent = message;
      mark_failed(list, view.current);
    },
  };
}
