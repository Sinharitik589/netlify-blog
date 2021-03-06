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
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).catch((error) => {
  console.log(error, "error in mongoose");
});

const router = express.Router();
var whitelist = ["http://127.0.0.1:3000", "https://sinharitik589.github.io", "http://localhost:3000", "https://603da5459ab6b40008a76e75--gallant-panini-fbcf17.netlify.app/"];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
require("./mongo/index");
require("./routes/index")(router, app);

app.use("/.netlify/functions/api", router);

module.exports.handler = Serverless(app);
