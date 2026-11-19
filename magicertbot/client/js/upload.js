import { $, size_text } from "./helpers.js";
import { drop_markup } from "./drop_markup.js";
import { read_as_base64 } from "./read_file.js";

// A drop area for the certificate zip. While it uploads it shows a gear
// and the real upload percent. "handle" sends the zip and uses the result.
export function setup_drop(slot, title, handle) {
  slot.innerHTML = drop_markup(title);
  const [drop, input, idle, busy, card, error, retry] = [".drop", "input", ".drop_idle", ".mini_load", ".file_card", ".error", "[data-upload_retry]"].map((selector) => $(selector, slot));
  let last_file = null;

  const reset = () => {
    drop.hidden = false;
    card.hidden = true;
    busy.hidden = true;
    idle.style.display = "contents";
    drop.classList.remove("busy");
  };
  const show_percent = (percent) => {
    $(".pct", busy).textContent = `${Math.floor(percent)}%`;
    $(".bar span", busy).style.width = `${percent}%`;
    $(".bar", busy).setAttribute("aria-valuenow", String(Math.floor(percent)));
  };

  async function take(file) {
    error.textContent = "";
    retry.hidden = true;
    if (!/\.zip$/i.test(file.name)) { error.textContent = "Please choose a .zip file."; return; }
    if (file.size > 2 * 1024 * 1024) { error.textContent = "This zip is bigger than 2 MB. Please keep only your certificate files in it."; return; }
    last_file = file;
    idle.style.display = "none";
    busy.hidden = false;
    drop.classList.add("busy");
    $(".up_name", busy).textContent = `Uploading ${file.name}`;
    show_percent(0);
    try {
      await handle({ file, zip_base64: await read_as_base64(file), on_upload: show_percent });
      reset();
      drop.hidden = true;
      card.hidden = false;
      $(".name", card).textContent = file.name;
      $(".size", card).textContent = size_text(file.size);
    } catch (problem) {
      reset();
      error.textContent = problem.message;
      retry.hidden = false; // "Try again" sends the same file once more.
    }
  }

  ["dragenter", "dragover"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.add("dragging"); }));
  ["dragleave", "drop"].forEach((name) => drop.addEventListener(name, (event) => { event.preventDefault(); drop.classList.remove("dragging"); }));
  drop.addEventListener("drop", (event) => { const file = event.dataTransfer.files[0]; if (file) take(file); });
  input.addEventListener("change", () => { const file = input.files[0]; if (file) take(file); input.value = ""; });
  $("button", retry).addEventListener("click", () => { if (last_file) take(last_file); });
  $(".change", card).addEventListener("click", () => { reset(); slot.dispatchEvent(new Event("drop_reset")); input.click(); });
  return { reset };
}
