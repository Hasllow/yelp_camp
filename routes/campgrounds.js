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

// Middleware
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
