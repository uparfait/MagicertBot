const { friendly_error } = require("./errors");
const { seal_payload } = require("./handshake");

// Sends progress to the browser while the work is still running.
// Each update is one line, encrypted with the key from this request's
// handshake, so the page can open and read them one by one.
function open_stream(res) {
  const key = res.locals.payload_key;
  if (!key) throw new Error("Every answer must be encrypted, but this request has no key.");

  res.status(200);
  res.set({
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  // If the person closed the page, there is nobody left to write to.
  const is_open = () => !res.writableEnded && !res.destroyed;
  const send = (message) => {
    if (is_open()) res.write(`${JSON.stringify({ sealed: seal_payload(key, message) })}\n`);
  };
  const finish = (message) => {
    send(message);
    if (is_open()) res.end();
  };
  let steps = [];

  return {
    // The full list of steps, so the page can show what comes next.
    plan(list) {
      steps = list.filter(Boolean);
      send({ type: "plan", steps });
    },
    // Marks one step as the one running now.
    at(index) {
      const percent = Math.round((index / Math.max(steps.length, 1)) * 100);
      send({ type: "progress", index, percent, text: steps[index] || "" });
    },
    done: (data) => finish({ type: "done", data }),
    fail: (message) => finish({ type: "error", message }),
  };
}

// Wraps a task so it always ends with either the result or a clear message.
function stream_route(task) {
  return async (req, res) => {
    const tracker = open_stream(res);
    try {
      tracker.done(await task(req.body || {}, tracker));
    } catch (error) {
      tracker.fail(friendly_error(error));
    }
  };
}

module.exports = { stream_route };
