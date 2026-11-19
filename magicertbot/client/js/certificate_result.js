import { create_element, create_button, download_base64 } from "./dom.js";

const zip_files = [
  ["fullchain.pem", "your certificate plus the chain. Most web servers want this one."],
  ["privkey.pem", "your private key. Keep it secret and never share it."],
  ["cert.pem", "only your certificate, for servers that ask for it alone."],
  ["chain.pem", "the Let's Encrypt certificates that link yours to a trusted root."],
  ["request.csr", "the signing request. Only needed if your host asks for it."],
];

function days_from_now(date) {
  return Math.max(0, Math.round((date - Date.now()) / 86400000));
}

// Shows the finished certificate and starts the ZIP download.
export function show_certificate(container, result) {
  const valid_until = new Date(result.valid_until);
  const date_text = valid_until.toLocaleDateString(undefined, { dateStyle: "long" });
  const download = () => download_base64(result.file_name, result.zip_base64, "application/zip");

  const box = create_element("section", { class_name: "card result", attributes: { "aria-labelledby": "result_title" } }, [
    create_element("div", { class_name: "result_head" }, [
      create_element("h3", { text: "Your certificate is ready", attributes: { id: "result_title" } }),
      result.staging
        ? create_element("span", { class_name: "badge badge_expiring", text: "Test certificate" })
        : create_element("span", { class_name: "badge badge_valid", text: "Trusted" }),
    ]),
    create_element("p", {
      text: `It covers ${result.domains.join(", ")} and is valid until ${date_text}, which is ${days_from_now(valid_until)} days from now. Renew it a few weeks before then.`,
    }),
    result.staging
      ? create_element("p", { class_name: "notice", text: "This came from the practice server, so browsers will not trust it. Turn off test mode when you're ready for the real one." })
      : null,
    create_element("p", { class_name: "note", text: "Your download has started. The ZIP holds:" }),
    create_element("ul", { class_name: "zip_contents" }, zip_files.map(([name, note]) => (
      create_element("li", {}, [create_element("code", { text: name }), ` – ${note}`])
    ))),
    create_button(`Download ${result.file_name} again`, download),
    create_element("p", { class_name: "note", text: "Keep this ZIP somewhere safe. When it's time to renew, upload it in the Renew tab." }),
  ]);

  container.append(box);
  box.scrollIntoView({ behavior: "smooth", block: "start" });
  download();
}
