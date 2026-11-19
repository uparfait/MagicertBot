import { create_loader } from "./loader.js";
import { send_request } from "./request.js";
import { icon } from "./icons.js";

// After a failure: a "Try again" button, and a way back when it helps.
function wait_for_retry(box, back_view, back_text) {
  const back = back_view ? `<button type="button" class="btn btn_outline" data-back="${back_view}">${icon("back")}${back_text}</button>` : "";
  box.insertAdjacentHTML("beforeend", `<div class="actions retry_actions${back ? "" : " single"}">
    <button type="button" class="btn btn_primary" data-retry>${icon("retry")}Try again</button>${back}</div>`);
  const button = box.querySelector("[data-retry]");
  button.focus({ preventScroll: true });
  return new Promise((resolve) => button.addEventListener("click", resolve, { once: true }));
}

// Sends a request and shows its real progress in a gear loader.
// If it fails, the gear turns red, the real reason shows, and
// "Try again" sends the same request once more.
export async function run_with_loader(box, url, body, { upload_text = "", back_view = "", back_text = "Back" } = {}) {
  for (;;) {
    const loader = create_loader(box, upload_text ? 20 : 0);
    try {
      const data = await send_request(url, body, {
        on_upload: (percent) => { if (upload_text) loader.upload(percent, upload_text); },
        on_plan: (steps) => loader.plan(steps),
        on_progress: (message) => loader.at(message.index, message.text),
      });
      await loader.finish();
      return data;
    } catch (error) {
      loader.fail(error.message);
      await wait_for_retry(box, back_view, back_text);
    }
  }
}
