const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv').config()
const morgan = require('morgan')
const router = express.Router()

const PORT = 10001
const MONGO_URL = process.env.MONGO_URL
const MONGO_PORT = process.env.MONGO_PORT
const MONGO_DB = 'movies'
const Movie = require('./movieModel').Movie

const app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(morgan('combined'))
app.use('/api/movie', router)

async function initDB() {
	console.log(MONGO_URL)
	await mongoose.connect('mongodb://' + MONGO_URL + ':' + MONGO_PORT + '/' + MONGO_DB).then(() => console.log(MONGO_DB + ' database connected!')).catch(e => console.log(e.message))
}
initDB()

// routes
router.post('/add-movie', (req, res) => {
	const newMovie = Movie(req.body)

	Movie.findOne({_id: newMovie._id})
		.then(movie => {
			if(movie) res.send({message: 'Movie exists in our database!'})
			else 
				newMovie.save().then(() => res.send({message: 'Movie is added into our database!'}))
					.catch(e => res.send({error: e.message}))
		})
		.catch(e => res.send({error: e.message}))
})

router.post('/edit-movie', (req, res) => {
	Movie.findOneAndUpdate({_id: req.body.movieId}, req.body)
		.then(movie => {
			if(!movie) res.send({error: 'Cannot find movie in our database!'})
			else res.send({message: 'Movie has been updated!'})
		}).catch(e => res.send({error: e.message}))
})

router.post('/get-movie-details', (req, res) => {
	const movieIds = req.body.movieIds
	Movie.find({ _id: movieIds })
		.then(movies => res.send(movies))
		.catch(e => res.send({error: e.message}))
})

router.get('/get-movies-list', (req, res) => {
	Movie.find()
		.then(movies => res.send(movies))
		.catch(e => res.send({error: e.message}))
})

router.get('*', (req, res) => res.status(404).send({error: 'The movie API cannot find the requested endpoint!'}))
router.post('*', (req, res) => res.status(404).send({error: 'The movie API cannot find the requested endpoint!'}))

app.listen(PORT, () => console.log('Movie microservice started at port ' + PORT + '!'))