// Reads a chosen file as base64 text, ready to send inside JSON.
export function read_as_base64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("We could not read that file. Please try again."));
    reader.readAsDataURL(file);
  });
}
