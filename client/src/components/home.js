import '../css/home.css'
import MovieItem from './movieitem'
import Header from './header'
import { Fragment, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import configData from './config.json'

function Home() {
	const [movies, setMovies] = useState(null)
	const MOVIE_URL = process.env.REACT_APP_MOVIE_LIST_URL || configData.MOVIE_LIST_URL
	const navigate = useNavigate()

	const getMovies = () => {
		axios.get(MOVIE_URL)
			.then(resp => {
				if(resp.status !== 200) {}
				else setMovies(resp.data)
			})
			.catch(e => {})
	}

	// get movie list
	useEffect(() => {
		const user = sessionStorage.getItem('user')
		if(!user) navigate('/')
		getMovies()
	}, [])

	const updateCartCount = useRef(null)
	return (
		<Fragment>
			<Header updateCartCount={updateCartCount} />
			<div className='container'>
				<div className='row'>
					<div className='col-10 offset-1'>
						{movies && 
						<ul>
						{movies.map((movie, idx) => 
							<MovieItem key={idx} update={updateCartCount} {...movie} />
						)}
						</ul>}
					</div>
				</div>
			</div>
		</Fragment>
	)
}


export default Home;