const LandingPage = () => {
	const user = JSON.parse(localStorage.getItem("userData"))
	if(!user){
		return (
			<div>
				<h1>Welcome to Our Event Management System</h1>
				<p>Discover and participate in amazing events!</p>
				<p>Please <a href="/login">login</a> to access your dashboard.</p>
			</div>
		)
	}
	if(user.role === 'participant'){
		window.location.href = '/participantdashboard'
	} else if(user.role === 'organizer'){
		window.location.href = '/organizerdashboard'
	}
	else if(user.role === 'admin'){ 
        window.location.href = '/admindashboard'
    }
	return (
		<div>
			<h1>Welcome to Our Event Management System</h1>
			<p>Discover and participate in amazing events!</p>
			<p>Please login to access your dashboard.</p>
		</div>
	)
}

export default LandingPage
