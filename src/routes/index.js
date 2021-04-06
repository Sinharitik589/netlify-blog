const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Blog = mongoose.model("blog");
const User = mongoose.model("user");
const Feature = mongoose.model("featured");

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
    try {

      const arr = await Blog.find({}, "heading category imageUrl meta_description createdAt username name");
      const featured = await Feature.find({});
      res.send({ arr: arr.reverse(), featured }).status(200);
    }
    catch (e) {
      console.log(e);
      res.sendStatus(500);
    }

    /*   Blog.find({}, (err, docs) => {
        if (err) {
          res.sendStatus(500);
        } else {
          var arr = docs.map((item) => {
            const {
              heading,
              _id,
              meta_description,
              category,
              imageUrl,
              createdAt,
              username,
            } = item;
            let array = {
              heading,
              meta_description,
              _id,
              category,
              imageUrl,
              username,
              createdAt,
            };
            return array;
          });
          Feature.find({}, (err, docs) => {
            if (err) {
              res.sendStatus(500);
            } else {
              if (docs.length > 0) {
                let array = { arr, featured: docs[0].featured };
                res.json(array);
              } else {
                let array = { arr, featured: [] };
                res.json(array);
              }
            }
          });
        }
      }); */
  });

  router.get("/blog", (req, res) => {
    if (req.query["heading"]) {
      Blog.find({ name: `${decodeURIComponent(req.query["heading"])}` }, (err, docs) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.json(docs);
        }
      });
    } else {
      Blog.find({ category: `${req.query["category"]}` }, (err, docs) => {
        console.log(req.query["category"]);
        if (err) {
          res.sendStatus(500);
        } else {
          res.json(docs);
        }
      });
    }
  });

  router.get("/admin/blog", async (req, res) => {
    const { id } = req.query;
    try {
      const blog = await Blog.findById(id);
      res.send({ blog }).status(200);
    }
    catch (e) {

      console.log(e);
    }
  })

  router.put("/blog", authenticateUser, async (req, res) => {
    const {
      id,
      username,
      category,
      name,
      heading,
      imageUrl,
      description,
      meta_description,
      subheading,
      questions,
      urls,
      conclusion,
    } = req.body;
    try {
      const blog = await Blog.findById(id);
      blog.username = username;
      blog.category = category;
      blog.heading = heading;
      blog.imageUrl = imageUrl;
      blog.description = description;
      blog.meta_description = meta_description;
      blog.subheading = subheading;
      blog.questions = questions;
      blog.conclusion = conclusion;
      blog.urls = urls;
      blog.name = name;
      await blog.save();
      res.sendStatus(200);
    }
    catch (e) {
      res.sendStatus(500);
    }
  });
  router.get("/delete", authenticateUser, async (req, res) => {
    const { id } = req.query;
    try {
      await Blog.findByIdAndDelete(id);
      res.sendStatus(200);
    }
    catch (e) {
      console.log(e);
      res.sendStatus(500)
    }
  });

  router.post("/featured", authenticateUser, async (req, res) => {
    const { featured } = req.body;

    const feature = await Feature.find({});

    if (feature.length == 0) {
      new Feature({
        featured,
      })
        .save()
        .then(() => {
          res.sendStatus(200);
          console.log("created");
        })
        .catch((err) => {
          res.sendStatus(404);
          console.log(err);
        });
    } else {
      Feature.updateOne({}, { featured }, (err) => {
        if (err == null) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      });
    }
  });

  router.get("/featured", async (req, res) => {
    Feature.find({}, (err, docs) => {
      if (err) {
        res.sendStatus(500);
      } else {
        console.log(docs.length, "docs");
        if (docs.length > 0) {
          featured = docs;
          let object = { featured: featured[0].featured };
          res.json(object);
        } else {
          res.json({ featured: [] });
        }
      }
    });
  });

  router.get("/user", authenticateUser, (req, res) => {
    console.log(req.user);
    res.json(req.user.user.username);
  });
  router.post("/input", authenticateUser, (req, res) => {
    const {
      name,
      category,
      username,
      heading,
      imageUrl,
      meta_description,
      description,
      subheading,
      tags,
      questions,
      urls,
      conclusion,
    } = req.body;

    new Blog({
      username,
      category,
      heading,
      imageUrl,
      description,
      subheading,
      meta_description,
      tags,
      questions,
      urls,
      conclusion,
      name
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
