import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '../css/header.css'
import configData from './config.json'

function Header({ updateCartCount }) {
	const [cartCount, setCartCount] = useState(0)
	const navigate = useNavigate()

	const handleSignout = () => {
		sessionStorage.removeItem('user')
		sessionStorage.removeItem('token')
		navigate('/')
	}
	const CART_URL = process.env.REACT_APP_CUSTOMER_CART_URL || configData.CUSTOMER_CART_URL
	const getUserCart = () => {
		const user = sessionStorage.getItem('user')
		const customerId = user

		axios.get(CART_URL + customerId)
			.then(resp => {
				if(resp.status === 200) {
					let movies = resp.data.movies
					if(!movies) movies = []
					setCartCount(Object.keys(movies).length)
				}
			})
	}

	useEffect(() => {
		updateCartCount.current = getUserCart
		getUserCart()
	}, [])

	return (
		<header className='navbar navbar-expanded-xxl'>
			<div className='col-6 offset-2'>
				<Link to='/'><h2>Online Movie Store</h2></Link>
			</div>
			<div className='col-2'>
				<i className='fas fa-sign-out-alt fa-2x float-end me-4' title='Sign Out' onClick={handleSignout}></i>
				<Link to='/cart'>
					<i className='fas fa-shopping-cart fa-2x float-end me-5' title='Shopping Cart'>
						<span className="position-absolute translate-middle badge rounded-pill bg-dark">{cartCount}</span>
					</i>
				</Link>
				<Link to='/profile'><i className='fas fa-user fa-2x float-end me-3' title='Profile'></i></Link>
			</div>
		</header>
	)

}


export default Header;