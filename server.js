const express = require("express");
const path = require("path");
const app = express();

const VERSION = process.env.APP_VERSION || "v1.0.0";

/* Serve static files (your HTML, CSS, JS, images) */
app.use(express.static(path.join(__dirname)));

/* Version endpoint */
app.get("/version", (req, res) => {
  res.send(VERSION);
});

/* Health check endpoint (for ALB) */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
