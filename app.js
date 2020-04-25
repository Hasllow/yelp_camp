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
// REQUIRE ROUTES
// ======================
const campgroundRoutes = require("./routes/campgrounds"),
	commentRoutes = require("./routes/comments"),
	indexRoutes = require("./routes/index");

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
// seedDB();

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

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);

app.listen(3000, () => console.log("The YelpCamp Server Has Started!"));
