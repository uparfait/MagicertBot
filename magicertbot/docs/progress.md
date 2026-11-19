# The gear, the percent and the steps

While work runs, the page shows a turning gear, a big percent, a short
note, a bar that fills up and the list of steps.

## On the server: a plan, then progress

File: `src/stream.js`

The server answers right away and keeps the answer open. It writes one
line of JSON for each update (this is called NDJSON):

```json
{"type":"plan","steps":["Getting ready","Creating your Let's Encrypt account"]}
{"type":"progress","index":1,"percent":25,"text":"Creating your Let's Encrypt account"}
{"type":"done","data":{ ... }}
```

The **plan** lists every step first, so the page can show what comes
next. Each **progress** line marks the step running now. The last line
is either **done** with the result or **error** with a plain message.

Each line is encrypted before it is sent (see `secure_requests.md`).

## In the browser: reading lines as they arrive

File: `client/js/request.js`

`XMLHttpRequest` reports both the upload (`xhr.upload.onprogress`) and
each piece of the answer as it arrives (`xhr.onprogress`). Every full
line is opened and handled in order.

## Turning it into a percent

File: `client/js/loader.js`

- When a zip is uploaded, the first 20% follows the real upload.
- The rest follows the server's steps: with 4 steps, each one is 25%.
- Inside a long step the bar creeps forward slowly, so it never looks
  stuck, but it never passes the end of the step.
- The number never goes backwards.

## The step list

File: `client/js/loader_steps.js`

- a grey dot for steps still to come
- a small turning gear for the step running now
- a green tick for finished steps

## The gear

The gear is an SVG turned by a CSS animation. If something goes wrong it
stops and turns red, and the note shows the reason. People who ask their
device for less motion see a much slower turn.

The note sits in a `role="status"` area, so screen readers read each new
step out loud.
