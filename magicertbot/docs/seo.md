# Helping search engines

SEO means making a site easy for search engines to find, read and show.

## Real content in the HTML

The server sends the full page, with every heading and form already in
place. Search engines do not need to run any JavaScript to read it.

## A title and description for each tab

File: `src/page.js`

| Address | Title |
| --- | --- |
| `/` | Free SSL Certificates Made Simple from MagicertBot |
| `/renew` | Renew your SSL certificate from MagicertBot |
| `/check` | Check an SSL certificate from MagicertBot |

Each description says in plain words what that tab does.

## Other tags in the head

- `<link rel="canonical">`: the main address of each tab, built from the
  real host of the request, so it works on any domain.
- `keywords`, `author` and `robots` tags.
- Open Graph and Twitter tags, which shape how a shared link looks.
- `theme-color`, so phone browsers match the brand blue.
- A small JSON-LD block that tells search engines this is a free
  `WebApplication` in the security category.

## robots.txt and sitemap.xml

File: `src/seo_routes.js`

- `/robots.txt` lets search engines read every page except `/api/`, and
  points to the sitemap.
- `/sitemap.xml` lists the three tab addresses.

Both are built per request, so they always show the right domain.

## Clean, meaningful HTML

- `lang="en"` on the page
- one `<h1>`, then `<h2>` for each step and `<h3>` for parts of a result
- `<header>`, `<nav>`, `<main>` and `<footer>` around the right parts
- tabs are real links that search engines can follow

## Speed

Fast pages rank better. The page has no large libraries, the files are
small and the fonts load with `display=swap`. Styles and scripts load
from addresses with a fingerprint of their content (`src/asset_version.js`),
so browsers keep them for a long time and still get new ones after every
update.
