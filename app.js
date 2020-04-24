// ======================
// REQUIRE'S
// ======================
const LocalStrategy = require("passport-local"),
	Campground = require("./models/campground"),
	Comment = require("./models/comment"),
	bodyParser = require("body-parser"),
	User = require("./models/user"),
	passport = require("passport"),
	mongoose = require("mongoose"),
	express = require("express"),
	seedDB = require("./seeds"),
	app = express();

// ======================
// DB CONNECTION
// ======================
mongoose.connect("mongodb://localhost:27017/yelp_camp", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// ======================
// APP Configuration
// ======================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
seedDB();

// ======================
// PASSPORT Configuration
// ======================
app.use(
	require("express-session")({
		secret: "Athena is my God",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

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

// ======================
// COMMENTS ROUTES
// ======================

app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err) {
			console.log(err);
		} else {
			res.render("comments/new", { campground: foundCampground });
		}
	});
});

app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
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
});

// ======================
// AUTH ROUTES
// ======================

// Show Register Form
app.get("/register", (req, res) => {
	res.render("register");
});

// Handle Register Logic
app.post("/register", (req, res) => {
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
app.get("/login", (req, res) => {
	res.render("login");
});

// Handle Login Logic
app.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/campgrounds",
		failureRedirect: "/login",
	}),
	(req, res) => {}
);

// Handle Logout Logic
app.get("/logout", (req, res) => {
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

app.listen(3000, () => console.log("The YelpCamp Server Has Started!"));
