const Campground = require("../models/campground"),
	Comment = require("../models/comment"),
	middleware = require("../middleware"),
	express = require("express"),
	router = express.Router({ mergeParams: true });

// NEW - Comments
router.get("/new", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", { campground: foundCampground });
		}
	});
});

// CREATE - Comments
router.post("/", middleware.isLoggedIn, (req, res) => {
	// Lookup camgpround using ID
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// Create new comment
			Comment.create(req.body.comment, (err, comment) => {
				if (err) {
					req.flash("error", "Something went wrong");
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
					req.flash("success", "Successfully added a comment");
					res.redirect("/campgrounds/" + foundCampground._id);
				}
			});
		}
	});
});

// EDIT - Show form to edit comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if (err) {
			req.flash("error", "Something went wrong");
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
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err) => {
		if (err) {
			req.flash("error", "Something went wrong");
			res.redirect("back");
		} else {
			req.flash("success", "Updated comment successfully!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY - Delete campground
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndDelete(req.params.comment_id, (err) => {
		if (err) {
			req.flash("error", "Something went wrong");
			res.redirect("/campgrounds/" + req.params.id);
		} else {
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;
