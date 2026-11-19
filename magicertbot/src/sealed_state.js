const { state_key, seal_payload, open_payload } = require("./handshake");
const { make_friendly } = require("./errors");

const week_in_ms = 7 * 24 * 60 * 60 * 1000;

// There is no database, so the browser carries the order details
// between steps. They are sealed with a key only the server knows,
// so they cannot be read or changed on the way.
function seal_state(state) {
  const sealed = seal_payload(state_key, { ...state, sealed_at: Date.now() });
  return `${sealed.iv}.${sealed.data}`;
}

function open_state(text) {
  try {
    const [iv, data] = String(text || "").split(".");
    const state = open_payload(state_key, { iv, data });
    if (Date.now() - state.sealed_at > week_in_ms) throw new Error("too old");
    return state;
  } catch {
    throw make_friendly("This request has expired or was changed on the way. Please start again.");
  }
}

module.exports = { seal_state, open_state };
