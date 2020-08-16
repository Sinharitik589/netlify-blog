const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Blog = mongoose.model("blog");
const User = mongoose.model("user");

module.exports = (router, app) => {
  // Middleware for authenticating user
  const authenticateUser = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  };

  //Routes for authentication purpose
  router.post("/signup", async (req, res) => {
    const { name, password } = req.body;
    bcrypt.hash(password, 8, function (err, hash) {
      if (err) return res.json({ error: true });

      new User({
        username: name,
        password: hash,
      })
        .save()
        .then(() => {
          res.send("Signup Succesfull");
        })
        .catch((err) => {
          res.send("Signup Failed");
          console.log(err);
        });
    });
  });
  router.post("/login", async (req, res) => {
    let user = await User.findOne({ username: `${req.body.name}` });
    if (user == null) {
      return res.status(400).send("Cannot Find User");
    }

    try {
      bcrypt.compare(req.body.password, user.password, async function (
        err,
        valid
      ) {
        if (valid) {
          const access_token = await jwt.sign(
            { user },
            process.env.ACCESS_TOKEN_SECRET
          );
          res.json(access_token);
        } else {
          res.sendStatus(403);
        }
      });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

  //Route for content
  router.get("/", async (req, res) => {
    let blog = await Blog.find({});
    let arr = await blog.map((item) => {
      const { heading, description, category } = item;
      let array = { heading, description, category };
      return array;
    });
    res.json(arr);
  });

  router.get("/blog", async (req, res) => {
    let blog = await Blog.find({ heading: `${req.query["heading"]}` });
    res.json(blog);
  });

  router.post("/input", authenticateUser, (req, res) => {
    const {
      category,
      heading,
      imageUrl,
      description,
      subheading,
      tags,
      questions,
      urls,
    } = req.body;

    new Blog({
      category,
      heading,
      imageUrl,
      description,
      subheading,
      tags,
      questions,
      urls,
    })
      .save()
      .then(() => {
        res.send("done");
        console.log("done");
      })
      .catch((e) => {
        console.log(e);
        res.send("error");
      });
  });
};
