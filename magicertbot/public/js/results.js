import { esc, fmt_date, fmt_short, days_left } from "./helpers.js";
import { icon } from "./icons.js";

export function status(left, before = 30) {
  if (left <= 0) return { text: "Expired", class_name: "bad", color: "var(--bad)" };
  if (left <= before) return { text: "Renew soon", class_name: "warn", color: "#D99A1E" };
  return { text: "Valid", class_name: "good", color: "var(--good)" };
}

// Days left, a bar showing how much time remains, and the two dates.
export function life_card(info) {
  const from = new Date(info.from);
  const to = new Date(info.to);
  const left = Math.max(days_left(to), 0);
  const remain = Math.min(100, Math.max(0, ((to - Date.now()) / (to - from)) * 100));
  const state = status(days_left(to));
  return `<div class="life_card">
    <div class="life_top"><div class="days"><b>${left}</b><span>${left === 1 ? "day" : "days"} left</span></div><span class="badge ${state.class_name}">${state.text}</span></div>
    <div class="life" aria-hidden="true"><span style="width:${remain}%;background:${state.color}"></span></div>
    <div class="life_dates"><span>Started ${fmt_short(from)}</span><span>Ends ${fmt_short(to)}</span></div>
  </div>`;
}

export function details_list(info) {
  const rows = [
    ["Covers", info.domains.map(esc).join("<br>")], ["Issued by", esc(info.issuer)],
    ["Valid from", fmt_date(info.from)], ["Valid until", fmt_date(info.to)],
    ["Key type", esc(info.key)], ["Signature", esc(info.signature)],
    ["Serial number", `<code>${esc(info.serial)}</code>`], ["SHA-256 fingerprint", `<code>${esc(info.fingerprint)}</code>`],
  ];
  return `<dl class="details">${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
}

const file_info = [
  ["cert", "cert.pem", "Your certificate", "The certificate for your website on its own.", true],
  ["chain", "chain.pem", "Middle certificate", "Links your certificate to a root that browsers already trust.", true],
  ["fullchain", "fullchain.pem", "Full chain", "Your certificate and the middle one together. Most web servers use this file.", true],
  ["privkey", "privkey.pem", "Private key", "The secret half of your certificate. Keep it safe and never share it.", true],
  ["readme", "README.txt", "Read me", "Explains each file in plain words.", false],
];

// What is in a zip. With found = null every file is shown as present.
export function zip_contents_list(found) {
  return `<ul class="list">${file_info.map(([key, file, title, text, needed]) => {
    const has = !found || found[key];
    const badge = has ? "" : needed ? '<span class="badge bad">Missing</span>' : '<span class="badge info">Not included</span>';
    return `<li><span class="ico ${!has && needed ? "bad" : ""}">${icon(has ? "file" : "minus")}</span>
      <span class="txt"><b><code>${file}</code> – ${title} ${badge}</b><span>${text}</span></span></li>`;
  }).join("")}</ul>`;
}

// Turns the file names in a zip into the keys used by zip_contents_list.
export const found_from_names = (names) => Object.fromEntries(names.map((name) => [{ "cert.pem": "cert", "chain.pem": "chain", "fullchain.pem": "fullchain", "privkey.pem": "privkey", "README.txt": "readme" }[name], true]));

export const hero = (picture, title, text) => `<div class="hero">${picture}<div><h2>${esc(title)}</h2><p>${text}</p></div></div>`;
