import { create_loader } from "./loader.js";
import { send_request } from "./request.js";

// Sends a request and shows its real progress in a gear loader.
// If it fails, the loader turns red and shows the message.
export async function run_with_loader(box, url, body, { upload_text = "" } = {}) {
  const loader = create_loader(box, upload_text ? 20 : 0);

  try {
    const data = await send_request(url, body, {
      on_upload: (percent) => { if (upload_text) loader.upload(percent, upload_text); },
      on_plan: (steps) => loader.plan(steps),
      on_progress: (message) => loader.at(message.index, message.text),
    });
    await loader.finish();
    return data;
  } catch (error) {
    loader.fail(error.message);
    throw error;
  }
}
