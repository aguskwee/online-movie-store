import '../css/reviewitem.css'

function ReviewItem(props) {
	return (
		<li className='col-12'>
			<div className='row'>
				<div className='col-2'>
					<img src={require('../images/poster-not-found.png')} />
				</div>
				<div className='col-10'>
					<div className='row'>
						<div className='col-12'>
							<h5>{props.title}</h5>
						</div>
					</div>
					<div className='row'>
						<div className='col-12'>
							<p className='price'>S$ {props.price}</p>
						</div>
					</div>
				</div>
			</div>
		</li>
	)
}

export default ReviewItem