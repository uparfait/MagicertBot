import { $ } from "./helpers.js";

// The pasted address must be on the same domain that was entered before,
// and must point to this exact check file.
export function check_address(value, proof) {
  const text = value.trim();
  if (!text) return `Please paste the address where the check file opens on ${proof.domain}.`;

  let address = null;
  try {
    address = new URL(text);
  } catch {
    return "Please paste the full address, starting with http://";
  }

  const host = address.hostname.toLowerCase().replace(/\.$/, "");
  if (!["http:", "https:"].includes(address.protocol)) return "The address should start with http:// or https://";
  if (host !== proof.domain) return `This address is on ${host}, but you entered ${proof.domain} before. Please use an address on ${proof.domain}.`;
  if (address.port) return "Please use an address without a port number.";
  if (address.pathname !== `/.well-known/acme-challenge/${proof.http.token}`) {
    return `The address should end with /.well-known/acme-challenge/${proof.http.token}`;
  }
  return "";
}

// Gathers how each address will be proven. Returns null when something needs fixing.
export function collect_proofs(panel, order, method) {
  const proofs = {};
  let first_problem = null;

  order.proofs.forEach((proof, index) => {
    if (method !== "http" || !proof.http) {
      proofs[proof.label] = { method: "dns" };
      return;
    }
    const input = $(`[data-proof_url="${index}"]`, panel);
    const message = check_address(input.value, proof);
    $(`[data-proof_error="${index}"]`, panel).textContent = message;
    input.closest(".field").classList.toggle("has_error", Boolean(message));
    if (message && !first_problem) first_problem = input;
    proofs[proof.label] = { method: "http", url: input.value.trim() };
  });

  if (first_problem) {
    first_problem.focus();
    first_problem.scrollIntoView({ behavior: "smooth", block: "center" });
    return null;
  }
  return proofs;
}
