// Tabs that work with a mouse, touch and keyboard (arrow keys, Home, End).
// Each tab has its own address, like /renew-certificate, so it can be shared as a link.
const tabs = [...document.querySelectorAll('[role="tab"]')];

function select_tab(tab, { focus = false, push = true } = {}) {
  for (const item of tabs) {
    const is_active = item === tab;
    item.setAttribute("aria-selected", String(is_active));
    item.tabIndex = is_active ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden = !is_active;
  }

  document.title = tab.dataset.title;
  if (focus) tab.focus();

  const address = tab.getAttribute("href");
  if (push && location.pathname !== address) history.pushState({}, "", address);
}

function handle_keys(event, index) {
  const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
  if (!(event.key in moves)) return;

  event.preventDefault();
  const next_index = (moves[event.key] + tabs.length) % tabs.length;
  select_tab(tabs[next_index], { focus: true });
}

export function setup_tabs() {
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", (event) => {
      // Let people open a tab in a new browser tab with Ctrl or Cmd.
      if (event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      select_tab(tab);
    });
    tab.addEventListener("keydown", (event) => handle_keys(event, index));
  });

  // The browser back and forward buttons switch tabs too.
  window.addEventListener("popstate", () => {
    const match = tabs.find((tab) => tab.getAttribute("href") === location.pathname);
    select_tab(match || tabs[0], { push: false });
  });
}
