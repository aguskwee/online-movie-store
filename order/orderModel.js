const mongoose = require('mongoose')

const Order = mongoose.Schema({
	customerId: {
		type: String,
		required: [true, 'Missing customer id!']
	},
	movies: Object,
	total: Number,
	status: String,
	statusMsg: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Order', Order)