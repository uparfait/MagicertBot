import { esc } from "./helpers.js";
import { icon } from "./icons.js";

// A label with a value and a copy button.
export const kv = (label, value) => `<div class="kv"><div class="kv_label">${esc(label)}</div>
  <div class="kv_value"><code>${esc(value)}</code><button type="button" class="copy_btn light" data-copy_text="${esc(value)}">${icon("copy")}Copy</button></div></div>`;

export const note = (html) => `<div class="note_box">${html}</div>`;

export const checklist = (items) => `<ul class="list" style="margin-bottom:16px">${items.map(([title, text]) => `
  <li><span class="ico">${icon("check")}</span><span class="txt"><b>${esc(title)}</b><span>${esc(text)}</span></span></li>`).join("")}</ul>`;

// The check file: its name is a unique ID from Let's Encrypt.
export function http_card(proof, index) {
  return `<div class="proof_card tone_sky">
    <h3>${icon("globe")}${esc(proof.label)} <span class="badge info">Check file</span></h3>
    ${kv("File name (your unique ID)", proof.http.token)}
    ${kv("Put it in this folder of your website", "/.well-known/acme-challenge/")}
    ${kv("Address Let's Encrypt opens", proof.http.url)}
    <button type="button" class="btn btn_outline" data-download_proof="${index}">${icon("download")}Download check file</button>
    <div class="field">
      <label class="label" for="proof_url_${index}">Paste the address where your file opens <span class="required" aria-hidden="true">*</span></label>
      <span class="hint" id="proof_hint_${index}">It must be on ${esc(proof.domain)}, the address you entered before.</span>
      <div class="input mono">${icon("link")}<input type="url" id="proof_url_${index}" data-proof_url="${index}" aria-required="true" aria-describedby="proof_hint_${index}" placeholder="${esc(proof.http.url)}" spellcheck="false" autocomplete="off"></div>
      <span class="error" data-proof_error="${index}"></span>
    </div>
  </div>`;
}

// The DNS record to add.
export function dns_card(proof) {
  return `<div class="proof_card tone_mint">
    <h3>${icon("dns")}${esc(proof.label)} <span class="badge info">TXT record</span></h3>
    ${kv("Record type", "TXT")}
    ${kv("Name", proof.dns.name)}
    ${kv("Value", proof.dns.value)}
  </div>`;
}

// What must be true for the check file to work.
export const http_checklist = () => checklist([
  ["Each address points to your website", "The DNS records for these addresses lead to the server that holds the file."],
  ["Port 80 is open", "Let's Encrypt opens your site on http:// to find the check file."],
  ["The file opens as plain text", "Upload it as it is, inside your site's main folder. Do not rename it or add .txt to the end."],
]);

export const dns_note = () => note("DNS changes can take a few minutes to show up everywhere. Wait a little after you add the record before you go on.");
