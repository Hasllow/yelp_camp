const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, (err, foundCampground) => {
			if (err) {
				req.flash("error", "Campground not found!");
				res.redirect("back");
			} else {
				// Check if campground found is not empty
				if (!foundCampground) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
				// Check if user own the campground
				if (foundCampground.author.id.equals(req.user._id)) {
					next();
				} else {
					// If not own, redirect
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		// If not logged, redirect
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if (err) {
				req.flash("error", "Comment not found!");
				res.redirect("back");
			} else {
				// Check if comment found is not empty
				if (!foundcomment) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
				// Check if user own the comment
				if (foundComment.author.id.equals(req.user._id)) {
					next();
				} else {
					// If not own, redirect
					req.flash("error", "You don't have permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		// If not logged, redirect
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
};

middlewareObj.isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
};

module.exports = middlewareObj;
