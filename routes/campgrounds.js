const Campground = require("../models/campground"),
	express = require("express"),
	router = express.Router();

// INDEX - Show all campgrounds
router.get("/", (req, res) => {
	// Get all campgrounds from DB
	Campground.find({}, (err, allCampgrounds) => {
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", { campgrounds: allCampgrounds });
		}
	});
});

// CREATE - Add new campground
router.post("/", isLoggedIn, (req, res) => {
	// Get data from form, add to the campgrounds array
	let name = req.body.name;
	let image = req.body.image;
	let desc = req.body.description;
	let author = {
		id: req.user._id,
		username: req.user.username,
	};
	let newCampground = {
		name: name,
		image: image,
		description: desc,
		author: author,
	};
	// Create new campground and save to database
	Campground.create(newCampground, (err, newlyCreated) => {
		if (err) {
			console.log(err);
		} else {
			// Redirect to campgrounds page
			res.redirect("/campgrounds");
		}
	});
});

// NEW - Show form for new campground
router.get("/new", isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// SHOW - Shows more info about a campground
router.get("/:id", (req, res) => {
	Campground.findById(req.params.id)
		.populate("comments")
		.exec((err, foundCampground) => {
			if (err) {
				console.log(err);
			} else {
				// Render showTemplate with that campground
				res.render("campgrounds/show", { campground: foundCampground });
			}
		});
});

// EDIT - Show form to edit campground information
router.get("/:id/edit", checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", { campground: foundCampground });
	});
});

// UPDATE - Edit campground information
router.put("/:id", checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndUpdate(
		req.params.id,
		req.body.campground,
		(err, updatedCampground) => {
			if (err) {
				res.redirect("/campgrounds");
			} else {
				res.redirect("/campgrounds/" + req.params.id);
			}
		}
	);
});

// DESTROY - Delete campground
router.delete("/:id", checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
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

function checkCampgroundOwnership(req, res, next) {
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, (err, foundCampground) => {
			if (err) {
				res.redirect("back");
			} else {
				// Check if user own the campground
				if (foundCampground.author.id.equals(req.user._id)) {
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
