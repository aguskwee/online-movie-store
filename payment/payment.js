const express = require('express')
const bodyParser = require('body-parser')
const amqp = require('amqplib')
const mongoose = require('mongoose')
const Payment = require('./paymentModel')
const dotenv = require('dotenv').config()
const morgan = require('morgan')
const router = express.Router()


const PORT = 10004
const MONGO_URL = process.env.MONGO_URL
const MONGO_PORT = process.env.MONGO_PORT
const MONGO_DB = 'payments'
const MQ_URL = process.env.RABBITMQ_URL
const PROCEED_PAYMENT_QUEUE = 'proceed-payment'
const PAYMENT_STATUS_QUEUE = 'get-payment-status'

app = express()
app.use(bodyParser.json())
app.use(morgan('combined'))
app.use('/api/payment', router)

// connect to mongoose db
async function initDB() {
	await mongoose.connect('mongodb://' + MONGO_URL + ':' + MONGO_PORT + '/' + MONGO_DB).then(() => console.log(MONGO_DB + ' database connected!')).catch(e => console.log(e.message))
}
initDB()

// connect to rabbitmq
async function initMQ() {
	await amqp.connect('amqp://' + MQ_URL)
		.then(conn => {
			conn.createChannel().then(channel => {
				console.log('RabbitMQ connected!')
				channel.assertQueue(PROCEED_PAYMENT_QUEUE)
				channel.assertQueue(PAYMENT_STATUS_QUEUE)
				channel.consume(PROCEED_PAYMENT_QUEUE, msg => {
					// TODO: connect to external party to make payment
					// simulate payment by creating random number with 5% failed
					const rnd = Math.random()
					const isFailed = rnd < 0.95 ? false : true

					// save to database
					let tmp = JSON.parse(msg.content)
					const payment = Payment(tmp)
					channel.ack(msg) 
					if(!isFailed) payment.save().then(() => channel.sendToQueue(PAYMENT_STATUS_QUEUE, Buffer.from(JSON.stringify({orderId: payment.orderId, isApproved: true}))))
										.catch(e => channel.sendToQueue(PAYMENT_STATUS_QUEUE, Buffer.from(JSON.stringify({orderId: payment.orderId, isApproved: false}))))
					else channel.sendToQueue(PAYMENT_STATUS_QUEUE, Buffer.from(JSON.stringify({orderId: payment.orderId, isApproved: isFailed})))
				})
			})
		})
}
initMQ()

// routes

router.get('*', (req, res) => res.status(404).send({error: 'The payment API cannot find the requested endpoint!'}))
router.post('*', (req, res) => res.status(404).send({error: 'The payment API cannot find the requested endpoint!'}))

app.listen(PORT, () => console.log('Payment microservice started at port ' + PORT + '!'))