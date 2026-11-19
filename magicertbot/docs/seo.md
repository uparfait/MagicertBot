# Helping search engines

SEO means making a site easy for search engines to find, read and show.

## Real content in the HTML

The server sends the full page, with every heading and form already in
place. Search engines do not need to run any JavaScript to read it.

## A title and description for each tab

File: `src/page.js`

Each tab has its own address, title and description:

| Address | Title |
| --- | --- |
| `/` | Free SSL certificates in minutes |
| `/renew` | Renew your SSL certificate |
| `/check` | Check an SSL certificate |

Each description is written for people and says what the page does.

## Canonical link

`<link rel="canonical">` tells search engines the main address of each
page. It is built from the real host of the request, so it works on any
domain without changes.

## Sharing previews

Open Graph tags (`og:title`, `og:description`, `og:url`) and Twitter card
tags control how a link looks when shared in chat apps and social media.

## Structured data

A small JSON-LD block tells search engines this is a free
`WebApplication` in the security category.

## robots.txt and sitemap.xml

File: `src/seo_routes.js`

- `/robots.txt` lets search engines read every page but not `/api/`, and
  points to the sitemap.
- `/sitemap.xml` lists the three tab addresses.

Both are built per request, so they always show the right domain.

## Clean, meaningful HTML

- `lang="en"` on the page
- one `<h1>`, then `<h2>` for each tab and `<h3>` inside cards
- `<header>`, `<nav>`, `<main>` and `<footer>` around the right parts
- tabs are real links that search engines can follow

## Speed

Fast pages rank better. The page uses system fonts, small CSS files, no
large libraries in the browser, and files are cached for one hour.
