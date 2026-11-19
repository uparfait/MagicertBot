import { esc, fmt_date, days_left } from "./helpers.js";
import { icon, seal_icon } from "./icons.js";
import { life_card, details_list, zip_contents_list, hero } from "./results.js";
import { plain_text } from "./check_plain.js";

export const check_list = (checks) => `<ul class="list">${checks.map(([state, title, text]) => `
  <li><span class="ico ${state}">${icon(state === "good" ? "check" : "alert")}</span>
  <span class="txt"><b>${esc(title)}</b><span>${esc(text)}</span></span></li>`).join("")}</ul>`;

function health_checks(report, left, before) {
  const { info } = report;
  const strong = /ECDSA|RSA (2048|3072|4096)/.test(info.key);
  return [
    left > 0
      ? [left > before ? "good" : "warn", left > before ? "Dates are fine" : "Renew soon", `It ends on ${fmt_date(info.to)}, in ${left} ${left === 1 ? "day" : "days"}.${left <= before ? " Renew it now to avoid any break." : ""}`]
      : ["bad", "This certificate has ended", `It ended on ${fmt_date(info.to)}. Browsers now show a warning. Renew it right away.`],
    { yes: ["good", "Private key matches", "privkey.pem belongs to this certificate. Your server can use them together."],
      no: ["bad", "Private key does not match", "privkey.pem belongs to a different certificate. Your web server will refuse to start with these two files."],
      missing: ["bad", "Private key is missing", "Without privkey.pem your web server cannot use this certificate."] }[report.key_match],
    report.chain_ok ? ["good", "Full chain is complete", "fullchain.pem has your certificate and the middle one, so every browser can trust it."]
      : ["warn", "Full chain is missing or not complete", "Some browsers and phones may not trust your site without it."],
    strong ? ["good", "Strong key", `${info.key} is a safe choice today.`] : ["warn", "Weak key", "Make a new certificate with ECDSA or RSA 2048 or more."],
    report.test_cert ? ["warn", "This is a test certificate", "Browsers do not trust test certificates. Make a new one without test mode for your live site."] : null,
    info.domains.some((domain) => domain.startsWith("*.")) ? ["good", "Covers all sub addresses", "The *. address covers every sub address on one level, like shop. or blog."] : null,
  ].filter(Boolean);
}

// The full report for a certificate zip.
export function report_html(report) {
  if (!report.readable) {
    const count = report.file_count;
    return `${hero(`<span class="ico">${icon("alert")}</span>`, "We could not read a certificate", `Your zip has ${count} ${count === 1 ? "file" : "files"}, but none of them is a certificate we can read.`)}
      <p class="plain">Please upload the zip you downloaded after making or renewing a certificate here. Below is what we looked for.</p>
      ${zip_contents_list(report.found)}`;
  }

  const left = days_left(report.info.to);
  const before = 30;
  const checks = health_checks(report, left, before);
  const problems = checks.filter((check) => check[0] === "bad").length;
  const warnings = checks.filter((check) => check[0] === "warn").length;
  const summary = problems ? `We found ${problems} ${problems === 1 ? "problem" : "problems"} you should fix.` : warnings ? `It works, with ${warnings} ${warnings === 1 ? "thing" : "things"} to look at.` : "Everything looks good.";

  return `${hero(seal_icon(), report.info.name, summary)}${life_card(report.info)}<p class="plain">${plain_text(report, left, before)}</p>
    <h3 class="section_title">Health checks</h3>${check_list(checks)}
    <h3 class="section_title">Certificate details</h3>${details_list(report.info)}
    <h3 class="section_title">Files in your zip</h3>${zip_contents_list(report.found)}`;
}
