import { icon } from "./icons.js";

// We keep no copy of a finished zip. Until it is downloaded, the page
// reminds people, and asks before they close the page or start over.
let is_unsaved = false;

window.addEventListener("beforeunload", (event) => {
  if (!is_unsaved) return;
  event.preventDefault();
  event.returnValue = "";
});

export const mark_unsaved = () => { is_unsaved = true; };
export const mark_saved = () => { is_unsaved = false; };

// True when it is fine to leave the finished zip behind.
export function leave_ok() {
  if (!is_unsaved) return true;
  const sure = window.confirm("You have not downloaded your zip yet. We keep no copy, so it will be lost. Leave it anyway?");
  if (sure) mark_saved();
  return sure;
}

export const download_warning = `<p class="download_warning" role="alert">${icon("alert")}<span><strong>Download your zip now.</strong>
  We keep no copy of it. If you leave or close this page without downloading it, it cannot be recovered.</span></p>`;
