import { $$, esc } from "./helpers.js";
import { icon } from "./icons.js";

const open_lists = new Set();

// A dropdown that matches the round fields. Works with mouse, touch and keys.
export function make_select(root, key, options, value, on_change) {
  const id = `select_${key}`;
  root.innerHTML = `<button type="button" class="select_btn" id="${id}_btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${id}_label ${id}_btn"><span class="select_text"></span>${icon("chev", "chev")}</button><ul class="select_list" role="listbox" tabindex="-1" aria-labelledby="${id}_label" hidden></ul>`;
  const button = root.querySelector(".select_btn");
  const list = root.querySelector(".select_list");
  let current = value;
  let active = 0;

  const render = () => {
    list.innerHTML = options.map((item, index) => `<li role="option" id="${id}_${index}" data-index="${index}" aria-selected="${item.value === current}">${icon("check", "opt_check")}<span>${esc(item.label)}${item.desc ? `<small>${esc(item.desc)}</small>` : ""}</span></li>`).join("");
    button.querySelector(".select_text").textContent = (options.find((item) => item.value === current) || options[0]).label;
  };
  const set_active = (index) => {
    active = Math.max(0, Math.min(options.length - 1, index));
    $$("li", list).forEach((item, number) => item.classList.toggle("active", number === active));
    list.setAttribute("aria-activedescendant", `${id}_${active}`);
    list.children[active].scrollIntoView({ block: "nearest" });
  };
  const close = (refocus) => {
    list.hidden = true;
    button.setAttribute("aria-expanded", "false");
    open_lists.delete(close);
    if (refocus === true) button.focus();
  };
  const open = () => {
    open_lists.forEach((other) => other());
    list.hidden = false;
    button.setAttribute("aria-expanded", "true");
    set_active(options.findIndex((item) => item.value === current));
    list.focus();
    open_lists.add(close);
  };
  const choose = (index) => {
    current = options[index].value;
    render();
    close(true);
    on_change(current);
  };
  const keys = {
    ArrowDown: () => set_active(active + 1), ArrowUp: () => set_active(active - 1), Home: () => set_active(0),
    End: () => set_active(options.length - 1), Enter: () => choose(active), " ": () => choose(active), Escape: () => close(true),
  };

  button.addEventListener("click", () => (list.hidden ? open() : close()));
  button.addEventListener("keydown", (event) => { if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) { event.preventDefault(); open(); } });
  list.addEventListener("keydown", (event) => { if (event.key === "Tab") close(); else if (keys[event.key]) { event.preventDefault(); keys[event.key](); } });
  list.addEventListener("click", (event) => { const item = event.target.closest("li"); if (item) choose(Number(item.dataset.index)); });
  list.addEventListener("mousemove", (event) => { const item = event.target.closest("li"); if (item && Number(item.dataset.index) !== active) set_active(Number(item.dataset.index)); });
  document.addEventListener("pointerdown", (event) => { if (!root.contains(event.target) && !list.hidden) close(); });
  render();
  return { set(next) { current = next; render(); } };
}
