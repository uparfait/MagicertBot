# Design

Calm and friendly: round shapes, soft blues and one clear action at a time.

## Colours

All colours live in `client/css/base.css` as CSS variables.

| Name | Colour | Used for |
| --- | --- | --- |
| Primary | `#1B78B3` | Buttons, the open tab, switches |
| Sky | `#4FA9DD` | The gear and the start of the bar |
| Sea | `#0C5A8A` | Links, focus borders, big numbers |
| Background | `#F4F7FA` | The page behind the white panel |
| Field | `#EEF3F7` | The inside of every field |
| Field border | `#D3DEE6` | The soft border every field has at rest |
| Mauve | `#8E5B8A` | The `*` on required fields |

White text on the primary blue passes the WCAG AA level.

## Fonts

**Plus Jakarta Sans** for text and **JetBrains Mono** for codes, both from
Google Fonts. If they cannot load, the system font is used.

## Fields

Files: `client/css/fields.css`, `client/css/controls.css`

- Fields are round pills with an icon on the left.
- A soft border at rest, and no shadow or glow ring. Only the border
  colour changes: light blue on hover, sea blue on focus.
- Autofill never changes a field's colours (see `client/css/autofill.css`).
- Dropdowns are custom lists that match the fields and work with the
  arrow keys, Enter and Escape.
- Choices with two options are a sliding pill (a segmented control).
- Yes or no options are switches.

## Required fields

Required fields show a mauve `*` after their label, and a short note
explains it. The input also has `aria-required="true"`.

## Every screen looks the same

The page is built for screens 600px wide and more. On a smaller screen, a
tiny script in `head.html` tells the browser to draw the page at 600px
and scale it down to fit. So a phone shows exactly the same layout as a
computer, only smaller. People can still pinch to zoom.

## Accessibility menu

An accessibility button sits at the bottom right of every page: a primary
blue background with a light icon. See `client/parts/footer.html`.

## Writing style

The text speaks like a helpful friend, with short sentences and simple
words: "Prove it's yours", "We can't see the DNS record yet. Please wait
a little and try again."
