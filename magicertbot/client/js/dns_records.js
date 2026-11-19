import { create_element, create_button, copy_text } from "./dom.js";

function make_row(label, value) {
  const copy = create_button("Copy", (button) => copy_text(value, button), "copy_button");
  copy.setAttribute("aria-label", `Copy ${label.toLowerCase()}`);
  return create_element("div", { class_name: "record_row" }, [
    create_element("span", { class_name: "record_label", text: label }),
    create_element("code", { class_name: "record_value", text: value }),
    copy,
  ]);
}

function make_record(record) {
  return create_element("li", { class_name: "record" }, [
    create_element("div", { class_name: "record_row" }, [
      create_element("span", { class_name: "record_label", text: "Type" }),
      create_element("code", { class_name: "record_value", text: "TXT" }),
    ]),
    make_row("Name", record.name),
    make_row("Value", record.value),
  ]);
}

// Shows the TXT records to add at the domain provider, and a button
// to tell us they are in place.
export function show_dns_records(container, order, on_ready) {
  const names = order.records.map((record) => record.name);
  const has_shared_name = new Set(names).size < names.length;

  const box = create_element("section", { class_name: "card records", attributes: { "aria-labelledby": "records_title" } }, [
    create_element("h3", { text: "Add these DNS records", attributes: { id: "records_title" } }),
    create_element("p", {
      text: "Open the DNS settings where you bought your domain, and add each record below as a new TXT record. This shows Let's Encrypt that the domain is yours.",
    }),
    create_element("ul", { class_name: "record_list" }, order.records.map(make_record)),
    has_shared_name
      ? create_element("p", { class_name: "notice", text: "Some records have the same name. That's fine: add all of them, one for each value." })
      : null,
    create_element("p", {
      class_name: "note",
      text: "Some providers only want the first part of the name, like _acme-challenge. New records can take a few minutes to show up.",
    }),
    create_button("I've added them, check now", on_ready),
  ]);

  container.append(box);
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}
