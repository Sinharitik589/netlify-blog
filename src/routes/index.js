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
    console.log(req);
    Blog.find({}, (err, docs) => {
      if (err) {
        res.sendStatus(500);
      } else {
        var arr = docs.map((item) => {
          const {
            heading,
            description,
            category,
            imageUrl,
            createdAt,
            username,
          } = item;
          let array = {
            heading,
            description,
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
              let object = { featured: docs[0].featured };
              let array = { arr, object };
              res.json(array);
            } else {
              let array = { arr, featured: [] };
              res.json(array);
            }
          }
        });
      }
    });
  });

  router.get("/blog", (req, res) => {
    Blog.find({ heading: `${req.query["heading"]}` }, (err, docs) => {
      if (err) {
        res.sendStatus(500);
      } else {
        console.log(docs, "docs");
        res.json(docs);
      }
    });
  });
  router.put("/blog", authenticateUser, async (req, res) => {
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
    Blog.updateOne(
      { heading: `${req.query["blog"]}` },
      {
        category,
        heading,
        imageUrl,
        description,
        subheading,
        tags,
        questions,
        urls,
      },
      (err) => {
        if (err == null) {
          console.log(questions, subheading);
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      }
    );
  });
  router.get("/delete", authenticateUser, (req, res) => {
    Blog.deleteOne({ heading: `${req.query["blog"]}` }, (err, docs) => {
      if (err) {
        console.log(err);
        res.sendStatus(404);
      } else {
        console.log(docs);
        res.sendStatus(200);
      }
    });
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
      username: req.user.user.username,
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
