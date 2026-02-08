import { Navigate, useParams } from "react-router-dom"
import api from '../api/axiosmiddleware';
import { useState, useEffect } from "react"

const ParticipantOrganizerView = () => {
    const user = JSON.parse(localStorage.getItem("userData"))
    const { organizerId } = useParams()
    const [organizer, setOrganizer] = useState(null)
    const [events, setEvents] = useState([])
    const [filtered, setFiltered] = useState([])
    
    if (!user) {
        return <Navigate to="/login" />
    }
    if(user.role !== 'participant') {
        if(user.role === 'organizer') {
            return <Navigate to="/organizerdashboard" />
        }
        return <Navigate to="/admindashboard" />
    }
    
    const getOrganizerDetails = async () => {
        try {
            const response = await api.get(`/api/users/getOrganizerDetails/${organizerId}`);
            setOrganizer(response.data.organizer);
        } catch(error) {
            alert("Error fetching organizer details: " + error.message);
        }
    }
    
    const getOrganizerEvents = async () => {
        try {
            const response = await api.get(`/api/events/getEventsByOrganizerForParticipant/${organizerId}`);
            setEvents(response.data.events);
            setFiltered(response.data.events);
        } catch(error) {
            alert("Error fetching organizer events: " + error.message);
        }
    }
    
    useEffect(() => {
        getOrganizerDetails()
        getOrganizerEvents()
    }, [organizerId])
    
    const filterEvents = (e) => {
        const now = new Date()
        if(e.target.value === "upcoming") {
            const temp = events.filter(event => new Date(event.eventStartDate) > now)
            setFiltered(temp)
        }
        else if(e.target.value === "past") {
            const temp = events.filter(event => new Date(event.eventEndDate) < now)
            setFiltered(temp)
        }
        else if(e.target.value === "all") {
            setFiltered(events)
        }
    }
    
    const handleEventClick = (eventId) => {
        window.location.href = `/participanteventview/${eventId}`;
    }
    
    if (!organizer) {
        return <div>Loading organizer details...</div>
    }
    
    return (
        <div>
            <h2>Organizer Details</h2>
            <div style={{border: '1px solid #ccc', padding: '15px', margin: '10px 0'}}>
                <h3>{organizer.organizername}</h3>
                <p><strong>Category:</strong> {organizer.category}</p>
                <p><strong>Description:</strong> {organizer.description}</p>
                <p><strong>Contact Email:</strong> {organizer.contactemail}</p>
            </div>
            
            <h2>Events</h2>
            <label>Filter events</label>
            <select onChange={filterEvents}>
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="past">Past Events</option>
            </select>
            
            {filtered.length === 0 ? <p>No events found</p> : filtered.map((event) => (
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
                    <button onClick={() => handleEventClick(event._id)}>View Event</button>
                </div>
            ))}
        </div>
    )
};

export default ParticipantOrganizerView;