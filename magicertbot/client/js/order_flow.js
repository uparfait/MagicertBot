import { set_step } from "./dom.js";
import { run_with_progress } from "./run_task.js";
import { show_dns_records } from "./dns_records.js";
import { show_certificate } from "./certificate_result.js";

// Getting a certificate happens in two parts:
// 1. Start: Let's Encrypt gives us DNS records for you to add.
// 2. Finish: Let's Encrypt checks them and signs your certificate.
export async function run_order_flow({ panel, start_url, start_body, finish_body, upload_text }) {
  const work_area = panel.querySelector("[data-work_area]");
  work_area.replaceChildren();
  set_step(panel, 1);

  const order = await run_with_progress(work_area, start_url, start_body, upload_text);
  set_step(panel, 2);

  const finish = async (button = null) => {
    if (button) button.disabled = true;
    try {
      const body = { ...finish_body, state: order.state };
      const result = await run_with_progress(work_area, "/api/certificate/finish", body);
      set_step(panel, 3);
      work_area.replaceChildren();
      show_certificate(work_area, result);
    } catch {
      // The message stays under the records, and they can check again.
      if (button) button.disabled = false;
    }
  };

  // If Let's Encrypt already trusts every domain, there is nothing to add.
  if (order.records.length) show_dns_records(work_area, order, finish);
  else finish();
}
