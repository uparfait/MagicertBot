// Makes file pickers friendlier: shows the chosen file name and
// accepts a file dragged onto the box.
export function setup_drop_zones() {
  for (const zone of document.querySelectorAll("[data-drop_zone]")) {
    const input = zone.querySelector('input[type="file"]');
    const title = zone.querySelector(".drop_title");
    const empty_text = title.textContent;

    const show_name = () => {
      const file = input.files[0];
      title.textContent = file ? file.name : empty_text;
      zone.classList.toggle("has_file", Boolean(file));
    };

    input.addEventListener("change", show_name);
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("is_dragging");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("is_dragging"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("is_dragging");
      if (!event.dataTransfer.files.length) return;
      input.files = event.dataTransfer.files;
      show_name();
    });
  }
}

// Reads the chosen ZIP and turns it into base64 text, ready to send as JSON.
export function read_zip(input) {
  const file = input.files[0];
  if (!file) return Promise.reject(new Error("Please choose a ZIP file first."));
  if (!/\.zip$/i.test(file.name)) {
    return Promise.reject(new Error("Please choose a .zip file. Put your certificate files into a ZIP, then try again."));
  }
  if (file.size > 2 * 1024 * 1024) {
    return Promise.reject(new Error("This ZIP is bigger than 2 MB. Please keep only your certificate files in it."));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("We could not read that file. Please try again."));
    reader.readAsDataURL(file);
  });
}
