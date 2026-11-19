# One page, three tabs

## One page, three addresses

Files: `src/app.js`, `src/page.js`

Each tab has its own address: `/create-new-certificate`,
`/renew-certificate` and `/check-existing-certificate`. Any other address
that is not a file or an API route, including `/`, is sent to
`/create-new-certificate` with a permanent (301) redirect.

The page is kept in small parts inside `client/parts/`:

`head.html`, `header.html`, `new_settings.html`, `new_options.html`,
`new_finish.html`, `renew.html`, `check.html` and `footer.html`

When the server starts, `page.js` joins them into one template. For each
request it fills in the blanks written like `{{title}}`:

- the title and description for that tab
- the full address for the canonical link
- which tab is open and which panels are hidden

The right tab is open from the very first moment. Every value is made
safe for HTML before it goes in.

## Tabs that everyone can use

File: `client/js/tabs.js`

- The row has `role="tablist"`, each tab has `role="tab"`, and each panel
  has `role="tabpanel"`.
- `aria-selected` marks the open tab.
- Arrow keys move between tabs. Home and End jump to the first and last.
- Each tab is a real link, so search engines can follow it and Ctrl or
  Cmd and click still opens it in a new browser tab.
- Switching tabs changes the address and the page title. The back button
  moves between tabs.

Between the tabs sits a short line with "Or" in its middle.

## Views inside a tab

File: `client/js/views.js`

Each tab has a few views, like `form`, `prove`, `work` and `done`. Only
one shows at a time. A small chip says "Step 1 of 3", and a **Back**
button returns to the earlier view. When a view opens, its heading gets
the focus, so screen readers and keyboard users know where they are.
