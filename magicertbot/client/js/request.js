// Sends JSON to the server and reports progress as a percent.
// The upload counts for the first part of the bar, then the server
// sends its own updates, one line of JSON at a time.
export function send_request(url, body, { on_progress, upload_text = "" }) {
  const upload_share = upload_text ? 25 : 0;
  let read_until = 0;
  let result = null;

  const handle_line = (message) => {
    if (message.type !== "progress") {
      result = message;
      return;
    }
    const percent = upload_share + (message.percent * (100 - upload_share)) / 100;
    on_progress(Math.round(percent), message.text);
  };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.upload.onprogress = (event) => {
      if (!upload_text || !event.lengthComputable) return;
      on_progress(Math.round((event.loaded / event.total) * upload_share), upload_text);
    };

    xhr.onprogress = () => {
      read_until = read_lines(xhr.responseText, read_until, handle_line);
    };

    xhr.onload = () => {
      read_lines(`${xhr.responseText}\n`, read_until, handle_line);
      if (result && result.type === "done") return resolve(result.data);
      reject(new Error((result && result.message) || "We could not finish that. Please try again."));
    };

    xhr.onerror = () => reject(new Error("We could not reach the server. Check your internet connection and try again."));
    on_progress(0, upload_text || "Getting started");
    xhr.send(JSON.stringify(body));
  });
}

// Reads every full line received so far and returns where it stopped.
function read_lines(text, start, handle_line) {
  let end = text.indexOf("\n", start);
  while (end !== -1) {
    const line = text.slice(start, end).trim();
    if (line) {
      try { handle_line(JSON.parse(line)); } catch { /* not JSON, skip it */ }
    }
    start = end + 1;
    end = text.indexOf("\n", start);
  }
  return start;
}
