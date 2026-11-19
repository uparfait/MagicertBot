const { friendly_error } = require("./errors");
const { seal_payload } = require("./handshake");

// Sends progress to the browser while the work is still running.
// Each update is one line of JSON, so the page can read them one by one.
function open_stream(res) {
  res.status(200);
  res.set({
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  const send = (message) => res.write(`${JSON.stringify(message)}\n`);
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
    done(data) {
      send({ type: "done", data });
      res.end();
    },
    fail(message) {
      send({ type: "error", message });
      res.end();
    },
  };
}

// Wraps a task so it always gets a tracker and always ends with
// either the result or a clear message.
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
