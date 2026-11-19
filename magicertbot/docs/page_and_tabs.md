# One page, three tabs

## The same page on every address

File: `src/app.js` and `src/page.js`

Express sends the same HTML page for every address that is not a file or
an API route. So `/`, `/renew`, `/check` and even a mistyped address all
open the app.

The page is kept in small parts inside `client/parts/`:

`head.html`, `header.html`, `panel_new.html`, `panel_renew.html`,
`panel_check.html` and `footer.html`

When the server starts, `page.js` joins them into one template. For each
request it fills in the blanks written like `{{title}}`:

- the page title and description for that tab
- the full address for the canonical link
- which tab is open, and which panels are hidden

Because this happens on the server, the right tab is open from the very
first moment, with no flash. Every value is made safe for HTML before it
goes in.

## Tabs that everyone can use

File: `client/js/tabs.js`

The tabs follow the WAI-ARIA tabs pattern:

- The tab row has `role="tablist"`, each tab has `role="tab"`, and each
  panel has `role="tabpanel"`.
- `aria-selected` marks the open tab, and `aria-controls` points to its
  panel.
- Only the open tab can be reached with the Tab key. The arrow keys move
  between tabs, and Home and End jump to the first and last.

Each tab is a real link (`<a href="/renew">`). This means:

- search engines can follow it
- Ctrl or Cmd and click still opens it in a new browser tab
- it works even before the JavaScript loads

When you switch tabs, the address bar and the page title change with
`history.pushState`. The browser's back and forward buttons move between
tabs too.

## Steps inside a tab

The New and Renew tabs show three steps (your details, prove it's yours,
download). The current step is marked with `aria-current="step"`, and
finished steps turn sea blue.
