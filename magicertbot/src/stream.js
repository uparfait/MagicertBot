const { friendly_error } = require("./errors");

// Sends progress updates to the browser while the work is still running.
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

  return {
    step: (percent, text) => send({ type: "progress", percent, text }),
    done: (data) => {
      send({ type: "done", data });
      res.end();
    },
    fail: (message) => {
      send({ type: "error", message });
      res.end();
    },
  };
}

// Wraps a task so it always gets a stream and always ends with
// either the result or a clear error message.
function stream_route(task) {
  return async (req, res) => {
    const stream = open_stream(res);
    try {
      const result = await task(req.body || {}, stream.step);
      stream.done(result);
    } catch (error) {
      stream.fail(friendly_error(error));
    }
  };
}

module.exports = { stream_route };
