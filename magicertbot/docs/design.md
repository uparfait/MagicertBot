# Design

The look is calm and simple: plenty of white space, one clear action per
card, and short, friendly text.

## Colours

All colours live in `client/css/base.css` as CSS variables.

| Name | Colour | Used for |
| --- | --- | --- |
| Primary, sky blue | `#4a9fd8` | Buttons, the progress bar, hover borders |
| Secondary, sea blue | `#0b5a8c` | Links, focus borders, button hover |
| Ink | `#0d2433` | Headings and button text |
| Muted | `#5c6d79` | Hints and notes |

Button text is dark ink on sky blue, and white on sea blue when hovered.
Both pairs are easy to read and pass the WCAG AA contrast level.

## Phone first

The CSS is written for small screens first. Wider screens get extra rules
inside `@media (min-width: 640px)`:

- cards get more padding
- the two Check forms sit side by side
- buttons shrink to their natural width
- the detail rows put the label beside the value

The page keeps a 16px gap at each side and never scrolls sideways.

## Form fields

File: `client/css/forms.css`

- Fields have no shadow and no glow ring.
- Only the border colour changes: sky blue when you hover, sea blue when
  the field is in focus.
- The font size is 16px, so phones do not zoom in when you tap a field.
- Every field has a real `<label>`, and hints are linked with
  `aria-describedby`, so screen readers read them too.

ZIP pickers are big drop zones. You can click them or drag a file onto
them. Once a file is chosen, the zone shows its name.

## Writing style

The text speaks to people like a helpful friend:

- "I've added them, check now" instead of "Continue"
- "We can't see the TXT record yet. Please wait a little and check again."
  instead of an error code

## Small touches

- A "Skip to main content" link for keyboard users.
- Clear focus outlines on buttons and tabs when using a keyboard.
- Less motion for people who ask their device for it.
- System fonts, so there is nothing extra to download.
