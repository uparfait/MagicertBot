import { seal_request, open_line, forget_server_key } from "./secure_channel.js";

// Sends an encrypted request, following the upload and each answer line as it arrives.
function post(url, key, envelope, handlers) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let [read_until, queue, result] = [0, Promise.resolve(), null];

    const handle = async (line) => {
      let message = JSON.parse(line);
      // Answers must be encrypted. Only a plain error (like "please refresh") is allowed.
      if (message.sealed) message = await open_line(key, message.sealed);
      else if (message.type !== "error") return;
      if (message.type === "plan") handlers.on_plan?.(message.steps);
      else if (message.type === "progress") handlers.on_progress?.(message);
      else result = message;
    };
    // Lines are opened one after another, so they always stay in order.
    const read_lines = (text) => {
      let end = text.indexOf("\n", read_until);
      while (end !== -1) {
        const line = text.slice(read_until, end).trim();
        read_until = end + 1;
        if (line) queue = queue.then(() => handle(line)).catch(() => {});
        end = text.indexOf("\n", read_until);
      }
    };

    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.timeout = 90000; // If nothing finishes in 90 seconds, stop and offer "Try again".
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) handlers.on_upload?.((event.loaded / event.total) * 100);
    };
    xhr.onprogress = () => read_lines(xhr.responseText);
    xhr.onload = async () => {
      read_lines(`${xhr.responseText}\n`);
      await queue;
      if (result && result.type === "done") return resolve(result.data);
      const error = new Error((result && result.message) || "We could not finish that. Please try again.");
      error.code = result && result.code;
      reject(error);
    };
    xhr.onerror = () => reject(new Error("We could not reach the server. Check your internet connection and try again."));
    xhr.ontimeout = () => reject(new Error("This took too long, so we stopped waiting. Please try again."));
    xhr.send(JSON.stringify(envelope));
  });
}

// If the server changed its key, we do the handshake again and retry once.
export async function send_request(url, body, handlers = {}, tries = 2) {
  const { key, envelope } = await seal_request(body);
  try {
    return await post(url, key, envelope, handlers);
  } catch (error) {
    if (error.code !== "handshake" || tries < 2) throw error;
    forget_server_key();
    return send_request(url, body, handlers, tries - 1);
  }
}
