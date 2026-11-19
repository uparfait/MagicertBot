// A last safety net: an error nobody caught is written to the log,
// but it never stops the server for everyone else.
let is_set = false;

function setup_crash_guard() {
  if (is_set) return;
  is_set = true;

  process.on("unhandledRejection", (reason) => {
    console.error("A promise failed and nobody caught it:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("An error was not caught:", error);
  });
}

module.exports = { setup_crash_guard };
