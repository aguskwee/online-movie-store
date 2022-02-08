import { Link } from 'react-router-dom'
import '../css/notfound.css'


function NotFound() {
	return (
		<div className='container'>
			<div className='row justify-content-md-center'>
				<div className='col-md-8 text-center'>
					<h1>404</h1>
					<h5>Sorry, the page does not exist!</h5>
					<Link to='/'><button className='btn btn-primary'>Home</button></Link>
				</div>
			</div>
		</div>
	)
}

export default NotFound;