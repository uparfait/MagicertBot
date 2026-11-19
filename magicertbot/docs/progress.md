# Progress in percent

Every action shows a box with a turning gear, a note about the current
step, a percent number and a bar that fills up.

## On the server: one line per update

File: `src/stream.js`

Instead of waiting until the end, the server answers right away and keeps
the answer open. Every time it reaches a new step, it writes one line of
JSON:

```json
{"type":"progress","percent":55,"text":"Placing your certificate order"}
```

The last line holds the result or an error:

```json
{"type":"done","data":{ ... }}
{"type":"error","message":"We can't see the TXT record yet ..."}
```

This format is called **NDJSON** (one JSON object per line). The helper
`stream_route` wraps every route, so each one gets the same updates and errors.

## In the browser: reading lines as they arrive

File: `client/js/request.js`

We use `XMLHttpRequest` instead of `fetch` because it can report both:

- **upload progress** through `xhr.upload.onprogress`
- **answer progress** through `xhr.onprogress`, which fires each time new
  text arrives

Each time new text arrives, we read every new full line.

## Turning two parts into one percent

When a ZIP is uploaded, the bar is shared:

- the first 25% follows the upload
- the last 75% follows the server's own percent

When nothing is uploaded, the server's percent fills the whole bar. The
bar never moves backwards, so it always feels like steady progress.

## The gear

File: `client/js/progress.js` and `client/css/progress.css`

The gear is a small SVG: a dashed ring makes the teeth, and a solid circle
makes the middle. A CSS animation turns it while work is running. It turns
green when the work is done and red if something goes wrong. People who ask
their device for less motion see a much slower turn.

The note text sits in an `aria-live` area, so screen readers read each new
step out loud.
