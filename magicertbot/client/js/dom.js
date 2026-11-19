// Small helpers for building and updating parts of the page.
export function create_element(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.class_name) element.className = options.class_name;
  if (options.text !== undefined) element.textContent = options.text;

  for (const [name, value] of Object.entries(options.attributes || {})) element.setAttribute(name, value);
  for (const child of children) if (child) element.append(child);
  return element;
}

export function create_button(text, on_click, class_name = "button") {
  const button = create_element("button", { class_name, text, attributes: { type: "button" } });
  button.addEventListener("click", () => on_click(button));
  return button;
}

export function show_form_error(form, message) {
  const box = form.querySelector(".form_error");
  box.textContent = message || "";
  box.hidden = !message;
}

export function set_busy(form, is_busy) {
  for (const control of form.elements) control.disabled = is_busy;
  form.setAttribute("aria-busy", String(is_busy));
}

export async function copy_text(text, button) {
  const old_text = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Copy failed";
  }
  setTimeout(() => { button.textContent = old_text; }, 2000);
}

// Turns base64 text from the server into a file the browser downloads.
export function download_base64(file_name, base64_text, type) {
  const bytes = Uint8Array.from(atob(base64_text), (letter) => letter.charCodeAt(0));
  const link = create_element("a", { attributes: { download: file_name } });
  link.href = URL.createObjectURL(new Blob([bytes], { type }));
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export function set_step(panel, step_number) {
  panel.querySelectorAll("[data-steps] li").forEach((item, index) => {
    if (index + 1 === step_number) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
    item.classList.toggle("is_done", index + 1 < step_number);
  });
}
