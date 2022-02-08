const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const morgan = require('morgan')
const router = express.Router()

const PORT = 10000
const MONGO_URL = process.env.MONGO_URL
const MONGO_PORT = process.env.MONGO_PORT
const MONGO_DB = 'customers'
const Customer = require('./customerModel')
const tokenSecret = 'mytokensecret'

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('combined'))
app.use('/api/customer', router)

// connect to mongoose db
function initDB() {
	mongoose.connect('mongodb://' + MONGO_URL + ':' + MONGO_PORT + '/' + MONGO_DB)
		.then(() => console.log(MONGO_DB + ' database connected!'))
		.catch(e => console.log(e.message))
}
initDB()

// routes
router.post('/register-user', (req, res) => {
	const newCustomer = Customer(req.body)

	if(mongoose.connection.readyState != 1) initDB()

	Customer.findOne({email: newCustomer.email}).then(customer => {
		if(!customer) {
			newCustomer.save()
			.then(() => res.send({message: 'New customer has been saved!', isSuccess: true})
			).catch(e => res.send({error: e.message}))
		}
		else return res.send({error: 'Customer exists in our database!'})
	}).catch(e => res.send({error: e.message}))
})

router.post('/edit-user', (req, res) => {
	if(mongoose.connection.readyState != 1) initDB()

	Customer.findOneAndUpdate({email: req.body.email}, req.body)
		.then(customer => {
			if(customer) res.send({message: 'Customer data has been updated!'})
			else res.send({error: 'Cannot update customer as it does not exist!'})
		}).catch(e => res.send({error: e.message}))
})

router.get('/get-customer-details/:customerId', (req, res) => {
	if(mongoose.connection.readyState != 1) initDB()

	const customerId = req.params.customerId
	Customer.findOne({_id: mongoose.Types.ObjectId(customerId)})
		.then(customer => {
			customer.password = undefined
			customer.createdAt = undefined
			res.send(customer)
		}).catch(e => res.send({error: 'Error retriving customer details!'}))
})

router.post('/add-credit-card', (req, res) => {
	const card = req.body
	const number = card.creditCardNumber,
		name = card.creditCardHolder,
		expiryDate = card.creditCardExpiryDate
	if(!number || !name || !expiryDate) return res.send({error: 'Incomplete credit card information!'})
	if(!card.email) return res.send({error: 'Please provider customer email!'})

	if(mongoose.connection.readyState != 1) initDB

	Customer.findOne({_id: md5(card.email)})
		.then(customer => {
			if(!customer) res.send({error: 'Cannot find customer in our database!'})
			else if(customer.creditCardNumber) res.send({error: 'Credit card exists in our database!'})
			else {
				customer.creditCardNumber = number
				customer.creditCardHolder = name
				customer.creditCardExpiryDate = expiryDate
				customer.save()
					.then(() => res.send({message: 'Credit card has been added!'}))
					.catch(e => res.send({error: e.message}))
			}
		})
		.catch(e => res.send({error: e.message}))
})

router.post('/delete-credit-card', (req, res) => {
	const email = req.body.email
	const custId = md5(email)

	// set credit card to null
	if(mongoose.connection.readyState != 1) initDB()

	Customer.findOneAndUpdate({_id: custId}, {$unset: {creditCardNumber: "", creditCardHolder: "", creditCardExpiryDate: ""}})
		.then(customer => {
			if(customer.creditCardNumber) res.send({message: 'Customer credit card has been deleted!'})
			else if(!customer.creditCardNumber) res.send({message: 'No credit card to be deleted!'})
			else res.send({error: 'Cannot find customer in our database!'})
		}).catch(e => res.send({error: e.message}))
})

router.post('/authenticate-user', (req, res) => {
	const email = req.body.email
	const password = req.body.password

	Customer.findOne({email: email}).then(customer => {
		if(!customer) return res.send({error: 'Customer does not exist!'})
		const pwd = customer.password
		if(pwd != password) return res.status(401).send({error: 'Invalid credentials!'})
		else {
			const token = jwt.sign({id: email}, tokenSecret, {expiresIn: '1d'})
			return res.send({token: token, user: customer._id})
		}
	}).catch(e => res.status(401).send({error: e.message}))

})

router.get('*', (req, res) => res.status(404).send({error: 'The customer API cannot find the requested endpoint!'}))
router.post('*', (req, res) => res.status(404).send({error: 'The customer API cannot find the requested endpoint!'}))

app.listen(PORT, () => console.log('Customer microservice started at port ' + PORT + '!'))