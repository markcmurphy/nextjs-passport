const express = require("express");
const passport = require("passport");
const BigCommerce = require("node-bigcommerce");

const router = express.Router();

const bigCommerce = new BigCommerce({
  clientId: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  callback: "https://6e6886393c43.ngrok.io/auth",
  responseType: "json",
});

router.get("/auth", (req, res, next) => {
  bigCommerce
    .authorize(req.query)
    .then((data) => console.log(data))
    .then((data) => res.render("auth", { title: "Authorized!" }));
});

router.get("/load", (req, res, next) => {
  try {
    const data = bigCommerce.verify(req.query["signed_payload"]);
    // console.log(data).then(res.redirect("/"));
    // res.render("welcome", { title: "Welcome!" });
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

router.get("/uninstall", (req, next) => {
  try {
    const data = bigCommerce.verify(req.query["signed_payload"]);
    console.log(data);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/login",
  passport.authenticate("auth0", {
    scope: "openid email profile",
  }),
  (req, res) => res.redirect("/")
);

router.get("/callback", (req, res, next) => {
  passport.authenticate("auth0", (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect("/login");
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();

  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, BASE_URL } = process.env;
  res.redirect(
    `https://${AUTH0_DOMAIN}/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${BASE_URL}`
  );
});

module.exports = router;
