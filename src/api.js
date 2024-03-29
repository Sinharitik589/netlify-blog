require("dotenv").config({ path: "/self/blog-backend/.env" });
const express = require("express");
const cors = require("cors");
const Serverless = require("serverless-http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json({ limit: '500mb' }));
const uri =
  "mongodb+srv://sinharitik589:DbpX8lVDiZvMJmTC@cluster0.5zdkf.mongodb.net/blog?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).catch((error) => {
  console.log(error, "error in mongoose");
});

const router = express.Router();
var whitelist = ["http://127.0.0.1:3000", "https://sinharitik589.github.io", "http://localhost:3000", "https://60434e9135964000077078ea--gallant-panini-fbcf17.netlify.app/"];

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors());


require("./mongo/index");
require("./routes/index")(router, app);

app.use("/.netlify/functions/api", router);

module.exports.handler = Serverless(app);
