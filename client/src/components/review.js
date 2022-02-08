
import { Fragment, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Header from './header'
import ReviewItem from './reviewitem'
import configData from './config.json'
import '../css/review.css'


function Review(props) {
	const [review, setReview] = useState(null)
	const [total, setTotal] = useState(0)
	const [orderId, setOrderId] = useState(null)
	const [status, setStatus] = useState(null)
	const navigate = useNavigate()

	const CART_URL = process.env.REACT_APP_CUSTOMER_CART_URL || configData.CUSTOMER_CART_URL
	const ORDER_URL = process.env.REACT_APP_NEW_ORDER_URL || configData.NEW_ORDER_URL
	const ORDER_STATUS_URL = process.env.REACT_APP_ORDER_STATUS_URL || configData.ORDER_STATUS_URL
	const MOVIE_DETAIL_URL = process.env.REACT_APP_MOVIE_DETAIL_URL || configData.MOVIE_DETAIL_URL
	const getUserCart = () => {
		const user = sessionStorage.getItem('user')
		const customerId = user

		axios.get(CART_URL + customerId)
			.then(resp => {
				if(resp.status !== 200 || (resp.data && resp.data.error)) {}
				else if(resp.status === 200 && resp.data.movies) {
					const movies = resp.data.movies

					axios.post(MOVIE_DETAIL_URL, {movieIds: Object.keys(movies)})
						.then(resp => {
							if(resp.status === 200 && resp.data) {
								let items = []
								let totalPrice = 0
								for(const m of resp.data) {
									if(movies[m._id]) {
										items.push({title: m.title, id: m._id, price: m.price})
										totalPrice += m.price
									}
								}
								setReview(items)
								setTotal(totalPrice)
							}
						})
				}
			})
	}

	// check cart
	useEffect(() => {
		if(!orderId) getUserCart()
		else if(status && status === 'Pending') {
			const timer = setInterval(() => {
				axios.get(ORDER_STATUS_URL + orderId)
					.then(resp => {
						if(resp.status === 200 && resp.data && resp.data.status)
							setStatus(resp.data.status)
					})
					.catch(e => console.log(e))
			}, 500)
			return () => clearInterval(timer)
		}
		else {
			clearInterval(timer)
			setTimeout(() => updateCartCount.current(), 1000)
		}
	}, [status])
	useEffect(() => {
		const user = sessionStorage.getItem('user')
		if(!user) navigate('/')
	})

	const timer = null
	const handleSubmit = () => {
		axios.post(ORDER_URL, {
			custId: sessionStorage.getItem('user')
		}).then(resp => {
			if((resp.status !== 200 && resp.status !== 202) || (resp.data && resp.data.error)) {}
			else {
				setOrderId(resp.data.orderId)
				setStatus('Pending')
			}
		}).catch(e => {})
	}

	const updateCartCount = useRef(null)
	return (
		<Fragment>
			<Header updateCartCount={updateCartCount} />
			<div className='container col-8'>
				{status === null &&
				<><div className='row'>
					<h3>Review Purchases</h3>
				</div>
				<div className='row'>
					{review && 
						<ul>
						{review.map((movie, idx) => 
							<ReviewItem key={idx} update={updateCartCount} {...movie} />
						)}
						</ul>}
				</div>
				<hr/>
				<div className='row'>
					<div className='text-right col-12'>
						<h6 className='float-end'>Total purchases <b>S$<span>{total}</span></b></h6>
					</div>
				</div>
				<br/>
				<div className='row'>
					<div className='col-12 text-right'>
						<button className='btn btn-primary float-end' onClick={handleSubmit}>Confirm And Pay</button>
					</div>
				</div></>}

				{status !== null &&
				<div className='row text-center mt-5'>
					{status === 'Success' ?
					<><i className='far fa-check-circle fa-5x'></i>
					<h5>Your order has been completed!</h5></>
					: status === 'Failed' ?
					<><i className='far fa-times-circle fa-5x'></i>
					<h5>Oops! Something wrong when processing your order!</h5></>
					:
					<><i className='far fa-clock fa-5x'></i>
					<h5>We are processing your order!</h5></>
					}
				</div>}
			</div>
		</Fragment>
	)
}

export default Review;