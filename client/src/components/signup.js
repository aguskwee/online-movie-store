import '../css/signup.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import configData from './config.json'
import md5 from 'md5'


function SignUp(props) {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [email, setEmail] = useState('')
	const [error, setError] = useState(1)

	const emailValidation = (email) => {
		const EMAIL_PTN = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
		if(!email.match(EMAIL_PTN)) return false
		return true
	}
	const handleValidation = () => {
		let isValid = 1
		if(email === '') isValid = 0
		else if(password === '') isValid = 0
		else if(confirmPassword === '') isValid = 0
		else if(password !== confirmPassword) isValid = -1
		else if(!emailValidation(email)) isValid = -3

		return isValid
	}
	const REGISTER_URL = process.env.REACT_APP_REGISTER_USER_URL || configData.REGISTER_USER_URL
	const handleLogin = () => {
		setError(1)
		const isValid = handleValidation()
		if(isValid === 1) {
			axios.post(REGISTER_URL, {
				email: email,
				password: md5(password)
			}).then(resp => {
				if(resp.status === 200 && resp.data.isSuccess) setError(2)
				else if(resp.status === 200 && resp.data.error === 'Customer exists in our database!') setError(-4)
				else setError(-2)
			})
		}
		else {
			setError(isValid)
		}
	} 

	return (
		<div className='container col-4 signup-form'>
			
			{error === 2 ?
			<><div className='row'>
				<p>Registation sucessful. Please sign in</p>
			</div>
			<br/>
			<div className='row'>
				<Link to='/'><button className='btn btn-primary btn-signin'>Sign In</button></Link>
			</div></>
			:
			<><div className='row'>
				<h4>Create An Account</h4>
			</div>
			<br/>
			<div className='row'>
				<input className='form-control' type='text' placeholder='Email Address' value={email} onChange={e => setEmail(e.target.value)} />
			</div>
			<br/>
			<div className='row'>
				<input className='form-control' type='password' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} />
			</div>
			<br/>
			<div className='row'>
				<input className='form-control' type='password' placeholder='Confirm Pasword' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
			</div>
			<br/>
			<br/>
			{error < 1 &&
			<><div className='row'>
				{error === 0 ?
				<p className='error'>Please fill all missing fields.</p>
				: error === -1 ?
				<p className='error'>Password do not match.</p>
				: error === -2 ?
				<p className='error'>Error register user!</p>
				: error === -4 ?
				<p className='error'>User exists in our database!</p>
				:
				<p className='error'>Invalid email</p>
				}
			</div>
			<br/></>}
			<div className='row'>
				<button id='signup-btn' className='btn btn-primary' onClick={handleLogin}>Create An Account</button>
			</div></>}
		</div>
	)
}

export default SignUp;