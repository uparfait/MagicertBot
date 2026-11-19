import { icon } from "./icons.js";

// Small helpers used all over the page.
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const day_ms = 86400000;

const swaps = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (letter) => swaps[letter]);

export const fmt_date = (date) => new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
export const fmt_short = (date) => new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
export const days_left = (to) => Math.ceil((new Date(to) - Date.now()) / day_ms);

export const clean_domain = (text) => String(text).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/[/?#].*$/, "").replace(/\.$/, "");
export const domain_ok = (domain) => /^(\*\.)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/.test(domain);
export const email_ok = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
export const size_text = (bytes) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

// Wraps a value in quotes when a shell would split it.
export const quote = (value) => (/[\s"'$`\\;&|<>()]/.test(value) ? `"${value.replace(/(["\\$`])/g, "\\$1")}"` : value);

export function download_blob(blob, name) {
  const address = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: address, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(address), 1500);
}

export function download_base64(name, base64_text) {
  const bytes = Uint8Array.from(atob(base64_text), (letter) => letter.charCodeAt(0));
  download_blob(new Blob([bytes], { type: "application/zip" }), name);
}

export async function copy_text(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = Object.assign(document.createElement("textarea"), { value: text });
    area.style.cssText = "position:fixed;opacity:0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  const old_html = button.innerHTML;
  button.innerHTML = `${icon("check")}Copied`;
  setTimeout(() => { button.innerHTML = old_html; }, 1400);
}

// Any button with data-copy (a selector) or data-copy_text copies on click.
export function setup_copy() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy], [data-copy_text]");
    if (!button) return;
    copy_text(button.dataset.copy_text ?? $(button.dataset.copy).textContent, button);
  });
}
