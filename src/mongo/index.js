const mongoose = require("mongoose");

const { Schema } = mongoose;

const blogSchema = new Schema({
  category: String,
  heading: String,
  imageUrl: String,
  description: String,
  subheading: Array,
  tags: Array,
  questions: Array,
  urls: Array,
});

const authSchema = new Schema({
  username: String,
  password: String,
});

mongoose.model("blog", blogSchema);
mongoose.model("user", authSchema);
