import { create_element } from "./dom.js";

const status_text = { valid: "Valid", expiring: "Expires soon", expired: "Expired", not_yet_valid: "Not valid yet" };

const format_date = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });

function make_summary(details) {
  if (details.status === "not_yet_valid") return "This certificate is not valid yet.";
  if (details.status === "expired") return `This certificate ran out ${-details.days_left} days ago. It's time for a new one.`;
  if (details.days_left < 1) return "This certificate runs out in less than a day. Renew it now.";
  const tip = details.status === "expiring" ? " Now is a good time to renew it." : "";
  return `This certificate is valid for ${details.days_left} more days.${tip}`;
}

function pick_text(value, yes_text, no_text) {
  if (value === undefined) return "";
  return value ? yes_text : no_text;
}

function make_rows(details) {
  return [
    ["Website", details.host],
    ["File", details.source],
    ["Domains", details.domains.join(", ")],
    ["Issued to", details.issued_to],
    ["Issued by", details.issued_by],
    ["Valid from", format_date(details.valid_from)],
    ["Valid until", format_date(details.valid_to)],
    ["Key", details.key],
    ["Trusted by browsers", pick_text(details.trusted, "Yes", `No. ${details.trust_note}`)],
    ["Private key", pick_text(details.key_matches, "Matches this certificate", "Does not match this certificate")],
    ["Certificates in file", details.chain_length],
    ["Self-signed", details.is_self_signed ? "Yes" : "No"],
    ["Serial number", details.serial_number],
    ["SHA-256 fingerprint", details.fingerprint],
  ].filter(([, value]) => value !== undefined && value !== "");
}

// Shows everything we found out about a certificate.
export function show_details(container, details) {
  const rows = make_rows(details).map(([label, value]) => create_element("div", {}, [
    create_element("dt", { text: label }),
    create_element("dd", { text: String(value) }),
  ]));

  const box = create_element("section", { class_name: "card result", attributes: { "aria-labelledby": "details_title" } }, [
    create_element("div", { class_name: "result_head" }, [
      create_element("h3", { text: "Certificate details", attributes: { id: "details_title" } }),
      create_element("span", { class_name: `badge badge_${details.status}`, text: status_text[details.status] }),
    ]),
    create_element("p", { text: make_summary(details) }),
    create_element("dl", { class_name: "details_list" }, rows),
  ]);

  container.replaceChildren(box);
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}
