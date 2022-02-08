import '../css/profile.css'
import Header from './header'
import axios from 'axios'
import { Fragment, useState, useRef, useEffect } from 'react'
import configData from './config.json'

function Profile() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [address, setAddress] = useState('')
	const [phone, setPhone] = useState('')
	const [creditNumber, setCreditNumber] = useState('')
	const [creditName, setCreditName] = useState('')
	const [creditExpiry, setCreditExpiry] = useState('')
	const [error, setError] = useState(1)


	const EDIT_CUSTOMER_URL = process.env.REACT_APP_EDIT_CUSTOMER_URL || configData.EDIT_CUSTOMER_URL
	const GET_CUSTOMER_URL = process.env.REACT_APP_GET_CUSTOMER_URL || configData.GET_CUSTOMER_URL
	const validateInput = () => {
		return true
	}
	const handleSubmit = () => {
		setError(false)
		const isValid = validateInput()
		if(isValid) {
			axios.post(EDIT_CUSTOMER_URL, {
				name: name,
				email: email,
				address: address,
				phoneNumber: phone,
				creditCardNumber: creditNumber,
				creditCardName: creditName,
				creditCardExpiryDate: creditExpiry
			}).then(resp => {
				if(resp.status !== 200 || resp.data.error) setError(-1)
				else setError(2)
			}).catch(e => setError(-1))
		}
	}
	useEffect(() => {
		const customerId = sessionStorage.getItem('user')
		if(customerId) {
			axios.get(GET_CUSTOMER_URL + customerId)
				.then(resp => {
					if(resp.status !== 200 || resp.data.error) setError(0)
					else {
						const customer = resp.data
						setName(customer.name)
						setEmail(customer.email)
						setAddress(customer.address)
						setPhone(customer.phoneNumber)
						setCreditNumber(customer.creditCardNumber)
						setCreditName(customer.creditCardName)
						setCreditExpiry(customer.creditCardExpiryDate)
					}
				})
		}
	}, [])

	const updateCartCount = useRef(null)
	return (
		<Fragment>
			<Header updateCartCount={updateCartCount} />
			<div className='container col-6 profile-form'>
				<div className='row'>
					<h2>My profile</h2>
				</div>
				<br/>
				<div className='row'>
					<input className='form-control' type='text' placeholder='Your Name' value={name} onChange={e => setName(e.target.value)} />
				</div>
				<br/>
				<div className='row'>
					<input className='form-control' type='text' placeholder='Email Address' value={email} onChange={e => setEmail(e.target.value)}/>
				</div>
				<br/>
				<div className='row'>
					<textarea className='form-control' placeholder='Your Address' value={address} onChange={e => setAddress(e.target.value)} />
				</div>
				<br/>
				<div className='row'>
					<input className='form-control' type='text' placeholder='Your Phone Number' value={phone} onChange={e => setPhone(e.target.value)} />
				</div>
				<br/>
				<hr/>
				<div className='row'>
					<h4>Credit card information</h4>
				</div>
				<div className='row'>
					<input className='form-control' type='text' placeholder='Your Credit Card Number' value={creditNumber} onChange={e => setCreditNumber(e.target.value)} />
				</div>
				<br/>
				<div className='row'>
					<input className='form-control' type='text' placeholder='Your Credit Card Name' value={creditName} onChange={e => setCreditName(e.target.value)} />
				</div>
				<br/>
				<div className='row'>
					<input className='form-control' type='text' placeholder='Your Credit Card Expiry (format: MM/YY)' value={creditExpiry} onChange={e => setCreditExpiry(e.target.value)}/>
				</div>
				<br/>
				{error < 1 &&
				<>
				<div className='row'>
					{error === 0 ?
					<p className='error'>Please fill all missing fields.</p>
					:
					<p className='error'>Error saving profile!</p>
					}
				</div>
				<br/></>}
				{error === 2 &&
				<><div className='row'>
					<p className='success'>Your profile has been saved!</p>
				</div>
				<br/></>}
				<div className='row'>
					<button className='btn btn-primary' onClick={handleSubmit}>Save Profile</button>
				</div>
			</div>
		</Fragment>
	)
}

export default Profile;