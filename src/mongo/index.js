const mongoose = require("mongoose");

const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    username: String,
    category: String,
    heading: String,
    imageUrl: String,
    description: String,
    subheading: Array,
    tags: Array,
    questions: Array,
    urls: Array,
    createdAt: Number,
    updatedAt: Number,
  },
  {
    timestamps: { currentTime: () => Date.now() },
  }
);

const authSchema = new Schema({
  username: String,
  password: String,
});

mongoose.model("blog", blogSchema);
mongoose.model("user", authSchema);
