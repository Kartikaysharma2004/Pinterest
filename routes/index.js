var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer')
const mongoose = require("mongoose")
// Configure passport
passport.use(new localStrategy(userModel.authenticate()));

// Serialize and deserialize user
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());


/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});

router.get('/login', function (req, res, next) {
  // console.log(req.flash('error'))
  res.render('login', { error: req.flash("error") });
});
router.get('/feed', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
 const post = await postModel.find()
  .populate("user")
  .populate("dp")

  res.render('feed', { user, post, nav: true }); // Pass 'user' to the feed.ejs template
});


router.post('/upload', isLoggedIn, upload.single('file'), async (req, res) => {
  try {
    // If no file is uploaded, return an error page
    if (!req.file) {
      return res.status(400).render('uploaderror', { message: "No file uploaded. Please try again." });
    }

    // Find the user by username stored in session
    const user = await userModel.findOne({ username: req.session.passport.user });

    if (!user) {
      return res.status(404).render('uploaderror', { message: "User not found." });
    }

    // Create a new post with the uploaded image
    const postdata = await postModel.create({
      image: req.file.filename,
      user: user._id
    });

    // Push the new post into the user's posts array and save
    user.posts.push(postdata._id);
    await user.save();

    // Redirect to profile after successful upload
    res.redirect('/profile');
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).render('uploaderror', { message: "Something went wrong! Please try again." });
  }
});


router.post('/setusername', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Check if the username is already taken
    const existingUser = await userModel.findOne({ username: req.body.username });

    if (existingUser) {
      return res.status(409).render('usernameerror', { message: "Username already taken." });
    }

    user.username = req.body.username;
    await user.save();
    res.redirect("/profile");
  } 
  catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


router.post('/setfullname', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.fullname = req.body.fullname;
  
  await user.save();
  res.redirect("/profile")
}
);

router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.dp = req.file.filename;
  await user.save();
  res.redirect("/profile")
// res.send("uploaded");
}
);

router.post('/setbio', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  user.bio = req.body.bio;
  await user.save();
  res.redirect("/profile")
}
);

router.get('/profile', isLoggedIn, async function (req, res) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user
    }).populate("posts");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render('profile', { user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post('/register', function (req, res) {
  const { username, email, fullname, password } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, password, function (err, user) {
    if (err) {
      return res.status(500).send(err);
    }
    passport.authenticate("local")(req, res, function () {
      res.redirect('/profile');
    });
  });
});

router.post('/login', passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));



router.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
