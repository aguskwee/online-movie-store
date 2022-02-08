import '../css/movieitem.css'
import { useState } from 'react'
import axios from 'axios'
import configData from './config.json'

function MovieItem(props) {
	const [error, setError] = useState(1)
	const [added, setAdded] = useState(false)

	const CART_ADD_URL = process.env.REACT_APP_ADD_TO_CART_URL || configData.ADD_TO_CART_URL
	const addToCart = e => {
		setError(1)
		axios.post(CART_ADD_URL, {
			custId: sessionStorage.getItem('user'),
			movieId: props._id,
			price: props.price
		}).then(resp => {
			if(resp.status !== 200) setError(0)
			else {
				props.update.current()
				setAdded(true)
			} 	
		}).catch(e => setError(0))
	}
	const CART_REMOVE_URL = process.env.REACT_APP_REMOVE_FROM_CART_URL || configData.REMOVE_FROM_CART_URL
	const removeFromCart = e => {
		setError(1)
		axios.post(CART_REMOVE_URL, {
			custId: sessionStorage.getItem('user'),
			movieId: props.id
		}).then(resp => {
			if(resp.status !== 200) setError(-1)
			else {
				props.update.current()
				props.onRemove()
			} 	
		}).catch(e => setError(-1))
	}

	return (
		<li className='col-3'>
		    <div className='card'>
		        <img src={require('../images/poster-not-found.png')} alt='movie-poster' />
		        <div className='body'>
		            <p className='title'>{props.title}</p>
		            {!props.isCart &&
		            <><p className='genre'>{props.genre}</p>
		            <p className='runtime'>{props.runtime} mins</p></>}
		            <p className='price'>S$ {props.price}</p>
		            {error === 0 &&
		            <p className='error'>Error adding to the cart</p>}
		            {!added ?
		            !props.isCart &&
		            <button className='btn btn-outline-info btn-sm float-end' onClick={e => addToCart(e)}>Add to cart</button>
		        	: 
		        	<button className='btn btn-secondary btn-sm float-end' disabled>Added</button>}
		        	
		        	{error === -1 &&
		            <p className='error'>Error removing movie from the cart</p>}
		            {props.isCart &&
		            <button className='btn btn-outline-danger btn-sm float-end' onClick={e => removeFromCart(e)}>Remove from cart</button>}
		        </div>
		    </div>
		</li>
	)
}

export default MovieItem;