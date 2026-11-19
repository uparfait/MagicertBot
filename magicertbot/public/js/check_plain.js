import { esc, fmt_date } from "./helpers.js";

// One short paragraph that explains the certificate in plain words.
export function plain_text(report, left, before) {
  const { info } = report;
  let text = `This certificate keeps <strong>${info.domains.map(esc).join(", ")}</strong> safe with HTTPS. It was issued by ${esc(info.issuer)} on ${fmt_date(info.from)}.`;
  if (left <= 0) text += ` It ended on <strong>${fmt_date(info.to)}</strong>, so visitors now see a warning. Renew it as soon as you can.`;
  else if (left <= before) text += ` It ends on <strong>${fmt_date(info.to)}</strong>, in ${left} days. It is time to renew it.`;
  else text += ` It ends on <strong>${fmt_date(info.to)}</strong>, so you have ${left} days left and nothing to do yet.`;
  if (report.key_match === "no") text += " Be careful: the private key in this zip belongs to another certificate.";
  if (report.test_cert) text += " This is a test certificate, so browsers will not trust it.";
  return text;
}
