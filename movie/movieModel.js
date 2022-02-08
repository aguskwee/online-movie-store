const mongoose = require('mongoose')

const MovieSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Please provide movie name!']
	},
	runtime: Number,
	releaseDate: Number,
	genre: String,
	price: Number,
	created_at: {
		type: Date,
		default: Date.now
	}
})

const Movie = mongoose.model('Movie', MovieSchema)

module.exports.Schema = MovieSchema
module.exports.Movie = Movie