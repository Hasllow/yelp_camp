const mongoose = require("mongoose");

// SCHEMA
const campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comments",
		},
	],
});

module.exports = mongoose.model("Campground", campgroundSchema);
