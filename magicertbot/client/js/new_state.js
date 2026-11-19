import { clean_domain } from "./helpers.js";
import { curves } from "./new_choices.js";

// Everything the New certificate form knows, kept in one place.
export const settings = {
  domains: [""],
  email: "",
  key_type: "ecdsa",
  curve: "secp256r1",
  rsa_size: "2048",
  cert_name: "",
  cert_name_touched: false,
  preferred_chain: "",
  test_cert: false,
  dry_run: false,
  no_email: false,
  agree: false,
  organization: "",
  country: "",
  state: "",
  locality: "",
};

// The addresses as typed, cleaned up, with no repeats.
export const clean_domains = () => [...new Set(settings.domains.map(clean_domain).filter(Boolean))];

export const key_label = (state) => (state.key_type === "rsa" ? `RSA ${state.rsa_size}` : `ECDSA ${curves[state.curve].label}`);

// The certificate name, or the first address without *.
export const certificate_name = () => (settings.cert_name.trim() || (clean_domains()[0] || "example.com").replace(/^\*\./, ""));

// The settings the server needs to make the key, the CSR and the zip.
export function server_settings() {
  return {
    key_type: settings.key_type,
    curve: settings.curve,
    rsa_size: settings.rsa_size,
    preferred_chain: settings.preferred_chain.trim(),
    cert_name: certificate_name(),
    details: { organization: settings.organization, country: settings.country, state: settings.state, locality: settings.locality },
  };
}
