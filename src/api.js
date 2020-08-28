require("dotenv").config({ path: "/self/blog-backend/.env" });
const express = require("express");
const cors = require("cors");
const Serverless = require("serverless-http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
app.use(bodyParser.json());
const uri =
  "mongodb+srv://sinharitik589:DbpX8lVDiZvMJmTC@cluster0.5zdkf.mongodb.net/blog?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true }).catch((error) => {
  console.log(error, "error in mongoose");
});

const router = express.Router();
require("./mongo/index");
require("./routes/index")(router, app);
app.use(cors({ origin: "http://127.0.0.1:5500" }));

app.use("/.netlify/functions/api", router);

module.exports.handler = Serverless(app);
