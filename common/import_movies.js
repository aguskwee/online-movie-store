const fs = require('fs')
const readline = require('readline')
const axios = require('axios')

const rl = readline.createInterface({
	input: fs.createReadStream('title.basics.c1000.tsv'),
	output: process.stdout,
	terminal: false
})
let count = 1
const total = 100
rl.on('line', item => {
	if(count > total) return
	item = item.split('\t')
	const movieId = item[0].trim()
	const primaryTitle = item[2].trim()
	const year = +item[5]
	const runtime = +item[7]
	const genre = item[8]
	if(genre == '\\N') return
	if(isNaN(runtime)) return
	if(year < 2021 || isNaN(year)) return

	const movie ={
		title: primaryTitle,
		runtime: runtime,
		releaseDate: year,
		genre: genre,
		price: +(20 + Math.random() * 20).toFixed(2)
	}
	axios.post('http://online-store.com/api/movie/add-movie', movie).then(resp => {

	}).catch(e => console.log(e))

	console.log(count++ + '. Processing ' + movieId + '...')
})
