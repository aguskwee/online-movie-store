const mongoose = require('mongoose')

const Customer = mongoose.Schema({
	name: String,
	address: String,
	email: {
		type: String,
		required: [true, 'Please provide customer email!']
	},
	password: {
		type: String,
		required: [true, 'Please provide customer password!']
	},
	phoneNumber: String,
	creditCardNumber: String,
	creditCardName: String,
	creditCardExpiryDate: String,
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('Customer', Customer)