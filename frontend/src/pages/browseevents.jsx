
import { Navigate } from "react-router-dom"

const BrowseEvents = () => {
	const user = JSON.parse(localStorage.getItem("userData"))
	if (!user) {
		return <Navigate to="/login" />
	}
	
	return (
		<div>
			<h1>Browse Events</h1>
			<p>List of events will appear here.</p>
		</div>
	)
}

export default BrowseEvents
