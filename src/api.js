const express = require("express");
const Serverless = require("serverless-http");

const app = express();

const router = express.Router();
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  next();
});

router.get("/", (req, res) => {
  res.json({
    hello: "hi",
  });
});

app.use("/.netlify/functions/api", router);

module.exports.handler = Serverless(app);
