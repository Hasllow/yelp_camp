const User = require("../models/user"),
	middleware = require("../middleware"),
	passport = require("passport"),
	express = require("express"),
	router = express.Router();

// ======================
// ROOT ROUTES
// ======================

// Redirect to landing page
router.get("/", (req, res) => {
	res.render("landing");
});

// ======================
// AUTH ROUTES
// ======================

// Show Register Form
router.get("/register", (req, res) => {
	res.render("register");
});

// Handle Register Logic
router.post("/register", (req, res) => {
	let newUser = new User({ username: req.body.username });
	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			req.flash("error", err.message);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to YelpCamp " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

// Show Login Form
router.get("/login", (req, res) => {
	res.render("login");
});

// Handle Login Logic
router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/campgrounds",
		failureRedirect: "/login",
	}),
	(req, res) => {}
);

// Handle Logout Logic
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

module.exports = router;
