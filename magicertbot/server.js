// Starts the app on your own computer or server.
const app = require("./src/app");

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`MagiCertbot is running at http://localhost:${port}`);
});
