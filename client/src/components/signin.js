import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import md5 from 'md5'
import configData from './config.json'
import '../css/signin.css'

function SignIn() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState(1)
	const AUTHENTICATION_URL = process.env.REACT_APP_AUTHENTICATION_URL || configData.AUTHENTICATION_URL
	let navigate = useNavigate()


	const handleValidation = () => {
		let isValid = 1
		if(email === '') isValid = 0
		else if(password === '') isValid = 0

		return isValid
	}

	const handleLogin = (props) => {
		setError(false)
		const isValid = handleValidation()

		if(isValid) {
			axios.post(AUTHENTICATION_URL, {
				email: email,
				password: md5(password)
			}).then(resp => {

				if(resp.data.token) {
					sessionStorage.setItem('user', resp.data.user)
					sessionStorage.setItem('token', resp.data.token)
					navigate('/home')
				}
				else if(resp.data.error === 'Customer does not exist!') setError(-3)
				else setError(-2)
			})
		}
		else setError(isValid)
	}

	useEffect(() => {
		// redirect to home if login
		const user = sessionStorage.getItem('user')
		if(user) navigate('/home')
	}, [])

	return (
		<div className='container col-4 signin-form'>
			<div className='row'>
				<h4>Sign In</h4>
			</div>
			<br/>
			<div className='row'>
				<input className='form-control' type='text' placeholder='Email Address' value={email} onChange={e => setEmail(e.target.value)}/>
			</div>
			<br/>
			<div className='row'>
				<input className='form-control' type='password' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
			</div>
			<br/>
			<br/>
			{error < 1 &&
			<><div className='row'>
				{error === 0 ?
				<p className='error'>Please fill all missing fields.</p>
				: error === -3 ?
				<p className='error'>Customer does not exist!</p>
				:
				<p className='error'>Error signin!</p>}
			</div>
			<br/></>}
			<div className='row'>
				<button className='btn btn-primary' onClick={handleLogin}>Log In</button>
			</div>
			<br/>
			<div className='row'>
				<p> Don't have an account? <Link to='/signup'>Sign Up</Link></p>
			</div>
		</div>
	)
}

export default SignIn;