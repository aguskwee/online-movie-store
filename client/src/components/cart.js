import MovieItem from './movieitem'
import Header from './header'
import { Fragment, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import configData from './config.json'
import '../css/cart.css'

function Cart() {
	const [cart, setCart] = useState(null)
	const navigate = useNavigate()

	const CART_URL = process.env.REACT_APP_CUSTOMER_CART_URL || configData.CUSTOMER_CART_URL
	const MOVIE_URL = process.env.REACT_APP_MOVIE_DETAIL_URL || configData.MOVIE_DETAIL_URL
	const getUserCart = () => {
		const user = sessionStorage.getItem('user')
		const customerId = user

		axios.get(CART_URL + customerId)
			.then(resp => {
				if(resp.status !== 200 || (resp.data && resp.data.error)) {}
				else if(resp.status === 200 && resp.data.movies) {
					const movies = resp.data.movies
					
					axios.post(MOVIE_URL, {movieIds: Object.keys(movies)})
						.then(resp => {
							if(resp.status === 200 && resp.data) {
								let items = []
								for(const m of resp.data) {
									if(movies[m._id]) items.push({title: m.title, id: m._id, price: m.price, isCart: true})
								}
								setCart(items)
							}
						})
				}
			})
	}

	// check cart
	useEffect(() => {
		const user = sessionStorage.getItem('user')
		if(!user) navigate('/')
		getUserCart()
	}, [])

	const updateCartCount = useRef(null)

	return (
		<Fragment>
			<Header updateCartCount={updateCartCount} />
			<div className='container'>
				<div className='row'>
					<div className='col-10 offset-1'>
						<h3>Shopping Cart</h3>
					</div>
				</div>
				<div className='row'>
					<div className='col-10 offset-1'>
						{cart && 
						<ul>
						{cart.map((movie, idx) => 
							<MovieItem key={idx} update={updateCartCount} onRemove={getUserCart} {...movie} />
						)}
						</ul>}
						{!cart && 
						<><br/>
						<h6>Your shoping cart is empty! Click <Link to='/home'>here</Link> to add movies!</h6>
						</>
						}
					</div>
				</div>
				{cart &&
				<><br/>
				<div className='row'>
					<div className='col-10 text-right'>
						<Link to='/checkout'><button className='btn btn-primary float-end'>Checkout</button></Link>
					</div>
				</div></>
				}
			</div>
		</Fragment>
	)
}

export default Cart;