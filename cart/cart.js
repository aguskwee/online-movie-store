const express = require('express')
const bodyParser = require('body-parser')
const redis = require('redis')
const amqp = require('amqplib')
const cors = require('cors')
const dotenv = require('dotenv').config()
const morgan = require('morgan')
const router = express.Router()

const PORT = 10002
const REDIS_HOST = process.env.REDIS_URL

const MQ_URL = process.env.RABBITMQ_URL
const GET_CART_LIST_QUEUE = 'get-cart-list'
const CUSTOMER_CART_QUEUE = 'customer-cart'
const CLEAR_CART_QUEUE = 'clear-cart'

app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('combined'))
app.use('/api/cart', router)
var redisClient

async function redisConnect() {
	redisClient = redis.createClient({url: 'redis://' + REDIS_HOST})
	redisClient.on('connect', () => console.log('Movie cart redis connected!'))
	.on('error', (e) => { console.log(e)
		console.log('Redis connection dropped. Try to reconnect...')
	})

	// redis v4, we should manually connect to redis
	await redisClient.connect()
}
redisConnect()

async function initMQ() {
	await amqp.connect('amqp://' + MQ_URL).then(conn => {
		console.log('Rabbit MQ connected!')
	 	conn.createChannel().then(channel => {
	 		channel.assertQueue(GET_CART_LIST_QUEUE)
			channel.consume(GET_CART_LIST_QUEUE, msg => {
				const custId = JSON.parse(msg.content).customerId
				const orderId = JSON.parse(msg.content).orderId
				redisClient.get(custId).then(cartList => {
					if(!cartList) cartList = []
					else cartList = JSON.parse(cartList)
					channel.sendToQueue(CUSTOMER_CART_QUEUE, Buffer.from(JSON.stringify({customerId: custId, orderId: orderId, cart: cartList})))
					channel.ack(msg)
				})
			}).catch(e => console.log(e.message))
		})

		conn.createChannel().then(channel => {
			channel.assertQueue(CLEAR_CART_QUEUE)
			channel.consume(CLEAR_CART_QUEUE, msg => {
				const custId = JSON.parse(msg.content).customerId
				redisClient.del(custId).then(() => channel.ack(msg))
			}).catch(e => console.log(e.message))
		})
	}).catch(e => console.log(e.message))
}
initMQ()

// routes
router.post('/add-movie', (req, res) => {
	const custId = req.body.custId
	const movieId = req.body.movieId
	const price = req.body.price
	if(!custId) return res.send({error: 'Missing customer ID!'})
	if(!movieId) return res.send({error: 'Missing movie ID!'})
	if(price == null) return res.send({error: 'Missing movie price!'})

	redisClient.get(custId).then(movies => {
		if(movies) movies = JSON.parse(movies)
		if((movies && movies[movieId] == null) || !movies) {
			if(!movies) movies = {}
			movies[movieId] = price
			redisClient.set(custId, JSON.stringify(movies), 'EX', 7 * 24 * 60 * 60)
				.then(() => res.send({message: 'Movie added into cart!'}))
				.catch(e => res.send({error: e.message}))
		}
		else res.send({error: 'Movie exists in the cart!'})
	}).catch(e => res.send({error: e.message}))
})

router.post('/remove-movie', (req, res) => {
	const custId = req.body.custId
	const movieId = req.body.movieId
	if(!custId) return res.send({error: 'Missing customer ID!'})
	if(!movieId) return res.send({error: 'Missing movie ID!'})

	redisClient.get(custId)
		.then(movies => {
			if(!movies) return res.send({'error': 'Cart is empty!'})
			movies = JSON.parse(movies)
			if(movies[movieId]) {
				delete movies[movieId]
				redisClient.set(custId, JSON.stringify(movies), 'EX', 7 * 24 * 60 * 60)
					.then(() => res.send({message: 'Movie remove from the cart!'}))
					.catch(e => res.send({error: e.message}))
			}
			else res.send({error: 'The specified movie not in the cart!'})
		})
})

router.get('/customer-movies/:customerId', (req, res) => {
	const customerId = req.params.customerId

	redisClient.get(customerId)
		.then(movies => {
			if(!movies) res.send({movies: null})
			else res.send({movies: JSON.parse(movies)})
		}).catch(e => res.send({error: e.message}))
})

router.get('*', (req, res) => res.send({error: 'The cart API cannot find the requested endpoint!'}))
router.post('*', (req, res) => res.send({error: 'The cart API cannot find the requested endpoint!'}))

// exit hook
process.on('SIGINT', () => {
	console.log('Disconnect from redis!')
	if(redisClient) redisClient.quit()
	process.exit()
})

app.listen(PORT, () => console.log('Movie cart microservice started at port ' + PORT + '!'))