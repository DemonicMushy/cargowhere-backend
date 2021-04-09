const express = require("express");
const cors = require("cors");

const controller = require("./controller");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res, next) => {
  res.send("Hello from backend");
});

app.get(
  "/carparks",
  controller.handleBasicAuth,
  controller.getStaticCarparkData
);
app.get(
  "/availability",
  controller.handleBasicAuth,
  controller.getAvailablility
);

module.exports = app;
