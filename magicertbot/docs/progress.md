# The gear, the percent and the steps

While work runs, the page shows a turning gear, a big percent, a short
note, a bar that fills up and the list of steps.

## On the server: a plan, then progress

File: `src/stream.js`

The server answers right away and keeps the answer open. It sends one
line for each update (this is called NDJSON). Inside, before encryption,
the lines look like this:

```json
{"type":"plan","steps":["Getting ready","Creating your Let's Encrypt account"]}
{"type":"progress","index":1,"percent":25,"text":"Creating your Let's Encrypt account"}
{"type":"done","data":{ ... }}
```

The **plan** lists every step first, so the page can show what comes
next. Each **progress** line marks the step running now. The last line
is **done** with the result, or **error** with the real reason.

On the wire every line is encrypted and looks like
`{"sealed":{"iv":"...","data":"..."}}` (see `secure_requests.md`).

## In the browser

Files: `client/js/request.js`, `client/js/loader.js`

`XMLHttpRequest` reports both the upload and each piece of the answer as
it arrives. Every full line is opened and handled in order.

- When a zip is uploaded, the first 20% follows the real upload.
- The rest follows the server's steps: with 4 steps, each one is 25%.
- Inside a long step the bar creeps forward slowly, so it never looks
  stuck, but it never passes the end of the step.
- The number never goes backwards.

The step list (`client/js/loader_steps.js`) shows a grey dot for steps
still to come, a small turning gear for the step running now and a green
tick for finished steps.

## When something goes wrong

File: `client/js/run_task.js`

The gear stops and turns red, the step that failed gets a red alert sign,
and the note shows the real reason, like Let's Encrypt refusing an
address. **Try again** sends the same request once more, and a second
button goes back to where it can be fixed ("Change settings", "Back to
your proof" or "Check another"). A failed zip upload has its own **Try
again** button that sends the same file again.

## The gear

An SVG turned by a CSS animation. People who ask their device for less
motion see a much slower turn. The note sits in a `role="status"` area,
so screen readers read each new step out loud.
