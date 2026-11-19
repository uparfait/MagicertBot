// The key choices in the New certificate form.
export const curves = {
  secp256r1: { label: "P-256", desc: "Recommended. Fast and strong" },
  secp384r1: { label: "P-384", desc: "Stronger, a little slower" },
};

export const rsa_sizes = {
  2048: { label: "2048 bits", desc: "Recommended. Works everywhere" },
  3072: { label: "3072 bits", desc: "Stronger, slower" },
  4096: { label: "4096 bits", desc: "Strongest, slowest" },
};

// Picking a key type also picks its recommended strength.
export const key_defaults = (type) => (type === "rsa" ? { rsa_size: "2048" } : { curve: "secp256r1" });

export const to_options = (choices) => Object.entries(choices).map(([value, item]) => ({ value, label: item.label, desc: item.desc }));

// Reads a key name like "ECDSA P-384" or "RSA 3072" back into settings.
export function key_settings_from(label = "") {
  const rsa = String(label).match(/^RSA (\d+)/);
  if (rsa) return { key_type: "rsa", rsa_size: rsa[1] };
  return { key_type: "ecdsa", curve: /P-384/.test(label) ? "secp384r1" : "secp256r1" };
}
