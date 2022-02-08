const mongoose = require('mongoose')

const Payment = mongoose.Schema({
	orderId: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Payment', Payment)