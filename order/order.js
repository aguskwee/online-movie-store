const express = require('express')
const bodyParser = require('body-parser')
const amqp = require('amqplib')
const mongoose = require('mongoose')
const Order= require('./orderModel')
const cors = require('cors')
const dotenv = require('dotenv').config()
const morgan = require('morgan')
const router = express.Router()

const PORT = 10003
const MONGO_URL = process.env.MONGO_URL
const MONGO_PORT = process.env.MONGO_PORT
const MONGO_DB = 'orders'
const MQ_URL = process.env.RABBITMQ_URL
const PAYMENT_STATUS_QUEUE = 'get-payment-status'
const GET_CART_LIST_QUEUE = 'get-cart-list'
const CUSTOMER_CART_QUEUE = 'customer-cart'
const PROCEED_PAYMENT_QUEUE = 'proceed-payment'
const CLEAR_CART_QUEUE = 'clear-cart'

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('combined'))
app.use('/api/order', router)

// connect to mongoose db
function initDB() {
	mongoose.connect('mongodb://' + MONGO_URL + ':' + MONGO_PORT + '/' + MONGO_DB).then(() => console.log(MONGO_DB + ' database connected!')).catch(e => console.log(e.message))
}
initDB()

// initialize rabbitMQ
let publishChannel
async function initMQ() {
	await amqp.connect('amqp://' + MQ_URL).then(conn => {
		console.log('RabbitMQ connected!')
		conn.createChannel().then(channel => {
			channel.assertQueue(PAYMENT_STATUS_QUEUE)
			channel.consume(PAYMENT_STATUS_QUEUE, msg => {
				payment = JSON.parse(msg.content)
				// update order id
				Order.findOneAndUpdate({_id: mongoose.Types.ObjectId(payment.orderId)}, {orderId: payment.orderId, status: payment.isApproved ? 'Success' : 'Failed'})
					.then(order => {
						if(!order) console.log('Cannot update order status as order id is not found!')
						else if(payment.isApproved) {
							// clear shopping cart
							publishChannel.sendToQueue(CLEAR_CART_QUEUE, Buffer.from(JSON.stringify({customerId: order.customerId})))
						}
					}).catch(e => console.log(e.message))
				channel.ack(msg)
			})
		}).catch(e => console.log(e.message))

		conn.createChannel().then(channel2 => {
			channel2.assertQueue(CUSTOMER_CART_QUEUE)
			channel2.consume(CUSTOMER_CART_QUEUE, msg => {
				const tmp = JSON.parse(msg.content)
				let movies = tmp.cart
				const customerId = tmp.customerId
				const orderId = tmp.orderId
				if(typeof(movies) == 'string') movies = JSON.parse(movies)
				channel2.ack(msg)

				if(movies.length == 0) {
					Order.findOneAndUpdate({_id: mongoose.Types.ObjectId(orderId)}, {movies: movies, status: 'Failed', statusMsg: 'Cart is empty!'})
						.then()
				}
				else {
					// compute total
					let total = 0
					Object.keys(movies).forEach((movieId) => total += movies[movieId])

					// save to db
					Order.findOneAndUpdate({_id: mongoose.Types.ObjectId(orderId)}, {customerId: customerId, movies: movies, total: total, status: 'Pending'})
						.then(() => {
							// proceed to payment
							publishChannel.sendToQueue(PROCEED_PAYMENT_QUEUE, Buffer.from(JSON.stringify({orderId: orderId, total: total})))
						}).catch(e => console.log(e))
				}
			})
		})

		// publisher
		conn.createChannel().then(channel => {
			publishChannel = channel
			publishChannel.assertQueue(CUSTOMER_CART_QUEUE)
			publishChannel.assertQueue(PROCEED_PAYMENT_QUEUE)
		}).catch(e => console.log(e.message))
	}).catch(e => console.log(e.message))
}
initMQ()

// routes
router.post('/new-order', (req, res) => {
	const customerId = req.body.custId
	if(!customerId) return res.send({error: 'No user provided!'})
	// create order id
	const order = Order({customerId: customerId})
	const orderId = order._id
	order.save().then(() => {
		publishChannel.sendToQueue(GET_CART_LIST_QUEUE, Buffer.from(JSON.stringify({customerId: customerId, orderId: orderId})))
		return res.status(202).send({message: 'Your order is being processed!', orderId: orderId})
	}).catch(e => {
		console.log(e.message)
		res.send({error: 'Error processing your order!'})
	})
})

router.get('/check-order-status/:orderId', (req, res) => {
	Order.findOne({_id: mongoose.Types.ObjectId(req.params.orderId)})
		.then(order => {
			if(!order) return res.status(404).send({error: 'Invalid order id!'})
			let msg = {orderId: req.params.orderId, movies: order.movies, total: order.total, status: order.status}
			if(order.status == 'Failed') msg.statusMsg = order.statusMsg
			res.send(msg)
		})
})

router.get('*', (req, res) => res.status(404).send({error: 'The order API cannot find the requested endpoint!'}))
router.post('*', (req, res) => res.status(404).send({error: 'The order API cannot find the requested endpoint!'}))

app.listen(PORT, () => console.log('Order microservice started at port ' + PORT + '!'))
