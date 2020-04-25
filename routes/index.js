const User = require("../models/user"),
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
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, () => {
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
	res.redirect("/campgrounds");
});

// Middleware
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
