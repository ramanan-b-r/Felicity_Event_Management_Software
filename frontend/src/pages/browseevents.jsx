
import { Navigate } from "react-router-dom"
import api from '../api/axiosmiddleware';

const BrowseEvents = () => {
	const user = JSON.parse(localStorage.getItem("userData"))
	if (!user) {
		return <Navigate to="/login" />
	}
	const getAllEvents = async () => {
		try{
			const response = await api.get('/api/events/getAllEvents')
			

		}
		catch(error){
			console.log(error)
		}

	}
	return (
		<div>
			<h1>Browse Events</h1>
			<p>List of events will appear here.</p>
		</div>
	)
}

export default BrowseEvents
