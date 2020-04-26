const Campground = require("../models/campground"),
	middleware = require("../middleware"),
	express = require("express"),
	router = express.Router();

// INDEX - Show all campgrounds
router.get("/", (req, res) => {
	// Get all campgrounds from DB
	Campground.find({}, (err, allCampgrounds) => {
		if (err) {
			console.log(err);
		} else {
			res.render("campgrounds/index", { campgrounds: allCampgrounds, page: "campgrounds" });
		}
	});
});

// CREATE - Add new campground
router.post("/", middleware.isLoggedIn, (req, res) => {
	// Get data from form, add to the campgrounds array
	let name = req.body.name;
	let price = req.body.price;
	let image = req.body.image;
	let desc = req.body.description;
	let author = {
		id: req.user._id,
		username: req.user.username,
	};
	let newCampground = {
		name: name,
		price: price,
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
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// SHOW - Shows more info about a campground
router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
			if (err) {
				console.log(err);
			} else {
				// Render showTemplate with that campground
				res.render("campgrounds/show", { campground: foundCampground });
			}
		});
});

// EDIT - Show form to edit campground information
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", { campground: foundCampground });
	});
});

// UPDATE - Edit campground information
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
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
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;
