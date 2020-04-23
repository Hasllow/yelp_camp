const bodyParser = require("body-parser"),
	express = require("express"),
	mongoose = require("mongoose"),
	app = express();

mongoose.connect("mongodb://localhost:27017/yelp_camp", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// SCHEMA

const campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
});

const Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create({
//     name: "Mountain Goat's Rest",
//     image: "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg",
//     description: "This is a huge mountain, where goats rest."
//     }
// );

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
			res.render("index", { campgrounds: allCampgrounds });
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
	res.render("new");
});

// SHOW - Shows more info about a campground
app.get("/campgrounds/:id", (req, res) => {
	// Find the campground with provided id
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
		} else {
			// Render showTemplate with that campground
			res.render("show", { campground: foundCampground });
		}
	});
});

app.listen(3000, () => console.log("The YelpCamp Server Has Started!"));
