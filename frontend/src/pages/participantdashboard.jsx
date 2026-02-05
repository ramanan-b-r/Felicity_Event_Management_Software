import { Navigate } from "react-router-dom"
import api from '../api/axiosmiddleware';
import {useState,useEffect, use} from "react"
const ParticipantDashboard = () => {
    const user = JSON.parse(localStorage.getItem("userData"))
    const [events,setEvents] = useState([])
    if (!user) {
        return <Navigate to="/login" />
    }
    if(user.role !== 'participant'){
      if(user.role ==='organizer'){
        return <Navigate to="/organizerdashboard" />
      }
      return <Navigate to="/admindashboard" />
    }
    const  getUpcomingEvents = async () => {
      try{
        const response = await api.get('/api/registration/getUpcomingEvents');
        console.log(response.data.events);
        setEvents(response.data.events);
      }catch(error){
        alert("Error fetching upcoming events")
      }
    }
    useEffect(() => {
        getUpcomingEvents()
    },[])
    const handleeventclick = (eventId) => {
		window.location.href = `/participanteventview/${eventId}`;
	}
    return (
      <div>
        <h2>Upcoming Events</h2>
        {events.map((event)=>(
			<div key={event._id} style={{border: '1px solid #ccc', padding: '15px', margin: '10px 0'}}>
				<h3>{event.eventName}</h3>
				<p><strong>Description:</strong> {event.eventDescription}</p>
				<p><strong>Type:</strong> {event.eventType}</p>
				<p><strong>Status:</strong> {event.eventStatus}</p>
				<p><strong>Eligibility:</strong> {event.eligibility}</p>
				<p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
				<p><strong>Event Start Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}</p>
				<p><strong>Event End Date:</strong> {new Date(event.eventEndDate).toLocaleDateString()}</p>
				<p><strong>Registration Limit:</strong> {event.registrationLimit}</p>
				<p><strong>Registered Count:</strong> {event.registeredCount}</p>
				<p><strong>Registration Fee:</strong> ₹{event.registrationFee}</p>
				<p><strong>Tags:</strong> {event.eventTags?.join(', ') || 'None'}</p>
				<p><strong>Event Category:</strong> {event.eventCategory}</p>
				<button onClick={() => handleeventclick(event._id)}> View Event</button>
			</div>
      
		  ))}
      </div>
    )
};
 
export default ParticipantDashboard;    