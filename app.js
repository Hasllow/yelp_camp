const Campground = require("./models/campground"),
	Comment = require("./models/comment"),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	express = require("express"),
	seedDB = require("./seeds"),
	app = express();

mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true,});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
seedDB();

// Redirect to landing page
app.get("/", (req, res) => {
	res.render("landing");
});

// INDEX - Show all campgrounds
app.get("/campgrounds", (req, res) => {
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
app.post("/campgrounds", (req, res) => {
	// Get data from form, add to the campgrounds array
	let name = req.body.name;
	let image = req.body.image;
	let desc = req.body.description;
	let newCampground = { name: name, image: image, description: desc };
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
app.get("/campgrounds/new", (req, res) => {
	res.render("campgrounds/new");
});

// SHOW - Shows more info about a campground
app.get("/campgrounds/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if (err) {
			console.log(err);
		} else {
			// Render showTemplate with that campground
			res.render("campgrounds/show", { campground: foundCampground });
		}
	});
});

// ======================
// COMMENTS ROUTES
// ======================

app.get("/campgrounds/:id/comments/new", (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: foundCampground});
		}
	});	
});

app.post("/campgrounds/:id/comments", (req, res) => {
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
					// Connect new comment to campground
					foundCampground.comments.push(comment);
					foundCampground.save();
					// Redirect campground show page
					res.redirect("/campgrounds/" + foundCampground._id);
				}
			});	
		}
	});	
})

app.listen(3000, () => console.log("The YelpCamp Server Has Started!"));
