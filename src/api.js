const express = require("express");
const Serverless = require("serverless-http");

const app = express();

const router = express.Router();

router.get("/", (req, res) => {
  res.send("hello");
});

app.use("/.netlify/functions/api", router);

module.exports.handler = Serverless(app);
