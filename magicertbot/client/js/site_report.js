import { esc, fmt_date, days_left } from "./helpers.js";
import { icon, seal_icon } from "./icons.js";
import { life_card, details_list, hero } from "./results.js";
import { check_list } from "./check_report.js";

// The report for a live website: what certificate it uses right now.
export function site_report_html(result) {
  const { info, host } = result;
  const left = days_left(info.to);
  const test_cert = /testing/i.test(info.issuer);

  const checks = [
    left > 0
      ? [left > 30 ? "good" : "warn", left > 30 ? "Dates are fine" : "Renew soon", `It ends on ${fmt_date(info.to)}, in ${left} ${left === 1 ? "day" : "days"}.`]
      : ["bad", "This certificate has ended", `It ended on ${fmt_date(info.to)}. Visitors see a warning.`],
    result.trusted
      ? ["good", "Browsers trust it", "Visitors see the lock and no warning."]
      : ["bad", "Browsers show a warning", result.trust_note || "Something about this certificate is not right."],
    /ECDSA|RSA (2048|3072|4096)/.test(info.key) ? ["good", "Strong key", `${info.key} is a safe choice today.`] : ["warn", "Weak key", "Use ECDSA or RSA 2048 or more next time."],
    info.self_signed ? ["warn", "Self-signed", "It signed itself, so no certificate authority stands behind it."] : null,
    test_cert ? ["warn", "This is a test certificate", "Browsers do not trust test certificates."] : null,
  ].filter(Boolean);

  const problems = checks.filter((check) => check[0] === "bad").length;
  const summary = problems ? `We found ${problems} ${problems === 1 ? "problem" : "problems"} on this website.` : "This website's certificate looks good.";
  const picture = problems ? `<span class="ico">${icon("alert")}</span>` : seal_icon();

  return `${hero(picture, host, summary)}${life_card(info)}
    <p class="plain"><strong>${esc(host)}</strong> uses a certificate from ${esc(info.issuer)} that covers <strong>${info.domains.map(esc).join(", ")}</strong>. It ends on <strong>${fmt_date(info.to)}</strong>.</p>
    <h3 class="section_title">Health checks</h3>${check_list(checks)}
    <h3 class="section_title">Certificate details</h3>${details_list(info)}`;
}
