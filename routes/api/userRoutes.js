const router = require("express").Router();
const User = require("../../lib/User");

router.post("/", (req, res) => {
  User.create({
    username: req.body.username,
    password: req.body.password
  }).then(newUser => {
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      password: newUser.password,
    };

    res.json({
      id: newUser.id,
      username: newUser.username,
    });
  }).catch(error => {
    console.error('Create user failed', error);
    res.status(400).json({error});
  });
});

router.post("/login", (req, res) => {
  console.log("Login Attempt");

  User.findOne({
    where: {
      username: req.body.username,
    },
  }).then(user => {
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const validPass = user.checkPassword(req.body.password);

    if (!validPass) {
      res.status(401).json({ message: "Incorrect Password" });
      return;
    }

    console.log("Log In Successful");

    req.session.user = {
      id: user.id,
      username: user.username,
      password: user.password,
    };

    res.json({
      id: user.id,
      username: user.username,
    });
  }).catch(error => {
    console.log(error);
    res.status(401).json({ message: "No user found", error });
  });
});

module.exports = router;
