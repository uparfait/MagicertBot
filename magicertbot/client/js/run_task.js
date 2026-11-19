import { set_busy } from "./dom.js";
import { send_request } from "./request.js";
import { create_progress } from "./progress.js";

// Runs one request and shows its progress inside the work area.
// If it fails, the message stays on screen so people can read it.
export async function run_with_progress(work_area, url, body, upload_text = "") {
  work_area.querySelectorAll(".progress").forEach((box) => box.remove());
  const progress = create_progress(work_area);
  work_area.lastElementChild.scrollIntoView({ behavior: "smooth", block: "nearest" });

  try {
    const data = await send_request(url, body, { on_progress: progress.update, upload_text });
    progress.finish("Done");
    progress.remove();
    return data;
  } catch (error) {
    progress.fail(error.message);
    throw error;
  }
}

// Locks a form while its work runs, then unlocks it again.
export async function run_form(form, task) {
  set_busy(form, true);
  try {
    await task();
  } catch {
    // The error message is already shown in the progress box.
  } finally {
    set_busy(form, false);
  }
}
