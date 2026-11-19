import { esc } from "./helpers.js";
import { icon, gear } from "./icons.js";

// The drop area: an idle look, an uploading look and the chosen file card.
export const drop_markup = (title) => `<label class="drop"><input type="file" accept=".zip,application/zip" aria-required="true" aria-label="${esc(title)}">
      <span class="drop_idle" style="display:contents"><span class="drop_icon">${icon("upload")}</span><strong>${esc(title)} <span class="required" aria-hidden="true">*</span></strong>
      <span class="hint">Click to choose it, or drop it here. It is the zip you downloaded when you made the certificate.</span></span>
      <span class="mini_load" hidden>${gear()}<span class="pct">0%</span><span class="hint up_name"></span>
      <span class="bar" role="progressbar" aria-label="Upload progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></span></span></label>
    <div class="file_card" hidden><span class="list"><span class="ico">${icon("zip")}</span></span><span class="name"></span><span class="size"></span><button type="button" class="copy_btn light change">Change</button></div>
    <p class="error" role="alert" style="margin:10px 0 0"></p>`;
