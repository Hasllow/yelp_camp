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

// EDIT - Show form to edit comment
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if (err) {
			res.redirect("back");
		} else {
			res.render("comments/edit", {
				campground_id: req.params.id,
				comment: foundComment,
			});
		}
	});
});

// UPDATE - Edit comment
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err) => {
		if (err) {
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY - Delete campground
router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
	Comment.findByIdAndDelete(req.params.comment_id, (err) => {
		if (err) {
			res.redirect("/campgrounds/" + req.params.id);
		} else {
			res.redirect("/campgrounds/" + req.params.id);
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

function checkCommentOwnership(req, res, next) {
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if (err) {
				res.redirect("back");
			} else {
				// Check if user own the comment
				if (foundComment.author.id.equals(req.user._id)) {
					next();
				} else {
					// If not own, redirect
					res.redirect("back");
				}
			}
		});
	} else {
		// If not logged, redirect
		res.redirect("back");
	}
}

module.exports = router;
