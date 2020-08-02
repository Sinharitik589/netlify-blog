const express = require("express");
const Serverless = require("serverless-http");

const app = express();

const router = express.Router();
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  next();
});

router.get("/", (req, res) => {
  res.json(
    {
      title: "Title1",
      name: "Movie1",
      disclaimer:
        "Do anim laboris cillum consectetur sit. Qui Lorem tempor duis aliqua ex dolor officia amet elit dolore veniam. Labore magna commodo enim irure in eiusmod veniam tempor magna. Veniam velit amet dolor voluptate cillum id laborum nisi tempor.",
    },
    {
      title: "Title2",
      name: "Movie2",
      disclaimer:
        "Do anim laboris cillum consectetur sit. Qui Lorem tempor duis aliqua ex dolor officia amet elit dolore veniam. Labore magna commodo enim irure in eiusmod veniam tempor magna. Veniam velit amet dolor voluptate cillum id laborum nisi tempor.",
    },
    {
      title: "Title3",
      name: "Movie3",
      disclaimer:
        "Do anim laboris cillum consectetur sit. Qui Lorem tempor duis aliqua ex dolor officia amet elit dolore veniam. Labore magna commodo enim irure in eiusmod veniam tempor magna. Veniam velit amet dolor voluptate cillum id laborum nisi tempor.",
    }
  );
});

app.use("/.netlify/functions/api", router);

module.exports.handler = Serverless(app);
