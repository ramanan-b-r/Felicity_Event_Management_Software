
import { useState ,useEffect} from "react"
import { Navigate, Link } from "react-router-dom";
import api from '../api/axiosmiddleware';
const EventsOrganized = () =>{
    const user = JSON.parse(localStorage.getItem("userData"));
    if(!user){
        return <Navigate to="/"/>
    
    }
    if(user.role !== "organizer"){
         return <Navigate to="/"/>
    }  
   
    const [events,setEvents] = useState([]);
    const fetchEventsOrganized = async () => {
        try{
            const response = await api.get('/api/events/getEventsByOrganizer');
            const allEvents = response.data.events || [];
            setEvents(allEvents);
        }
        catch(error){
            console.error("Error fetching events organized:", error);
        }

    }
    useEffect(()=>{
        fetchEventsOrganized();
    },[]);
    
    if(events.length === 0){
        return (
            <div>
                <h2>Events Organized</h2>
                <p>No events found.</p>
            </div>
        );
    }
    
    return (
        <div>
            <h2>Events Organized</h2>
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
                    <Link to={`/editevent/${event._id}`}>
                        <button>Edit Event</button>
                    </Link>
                </div>
            ))}
        </div>      
    );

}
export default EventsOrganized;