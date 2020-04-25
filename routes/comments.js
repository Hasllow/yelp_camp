const Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	express = require("express"),
	router = express.Router({ mergeParams: true });

// NEW - Comments
router.get("/new", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", { campground: foundCampground });
		}
	});
});

// CREATE - Comments
router.post("/", isLoggedIn, (req, res) => {
	// Lookup camgpround using ID
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// Create new comment
			Comment.create(req.body.comment, (err, comment) => {
				if (err) {
					console.log(err);
				} else {
					// Add Username and Id to the comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					// Connect new comment to campground
					foundCampground.comments.push(comment);
					foundCampground.save();
					// Redirect campground show page
					res.redirect("/campgrounds/" + foundCampground._id);
				}
			});
		}
	});
});

// Middleware
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
