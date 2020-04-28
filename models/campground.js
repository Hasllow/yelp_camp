const mongoose = require("mongoose");

// SCHEMA
const campgroundSchema = new mongoose.Schema({
	name: {
		type: String,
		required: "Campground namecannot be blank.",
	},
	price: String,
	image: String,
	description: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		username: String,
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comments",
		},
	],
	slug: {
		type: String,
		unique: true,
	},
});

// Add a slug before the campground gets saved in DB
campgroundSchema.pre("save", async function(next) {
	try {
		// Check if campground is being saved or updated
		if (this.isNew || this.isModified("name")) {
			this.slug = await generateUniqueSlug(this._id, this.name);
		}
		next();
	} catch (err) {
		next(err);
	}
});

let Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;

async function generateUniqueSlug(id, campgroundName, slug) {
	try {
		// Generate initial slug
		if (!slug) {
			slug = slugfy(campgroundName);
		}
		// Check if slug already exists
		let campground = await Campground.findOne({ slug: slug });
		// Check if a campground is found, or if the found campground is the current one
		if (!campground || campground._id.equals(id)) {
			return slug;
		}
		// If not unique, create a new slug
		let newSlug = slugify(campgroundName);
		// Check again by calling the function recursively
		return await generateUniqueSlug(id, campgroundName, newSlug);
	} catch (err) {
		throw new Error(err);
	}
}

function slugfy(text) {
	let slug = text.toString().toLowerCase()
	.replace(/\s+/g, "-")		// Replace spaces with -
	.replace(/[^\w\-]+/g, "")	// Replace all non words chars
	.replace(/\-\-+/g, "-")		// Replace multiple - with single -
	.replace(/^-+/, "")			// Trim - from start of text
	.replace(/-+$/, "")			// Trim - from end of text
	.replace(0, 75);			// Trim at 75 chars

	return slug + "-" + Math.floor(1000 + Math.random() * 9000); // Add 4 random numbers
}