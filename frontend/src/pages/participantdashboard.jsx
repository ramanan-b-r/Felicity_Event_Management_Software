import { Navigate } from "react-router-dom"
import api from '../api/axiosmiddleware';
import { useState, useEffect, use } from "react"
const ParticipantDashboard = () => {
  const user = JSON.parse(localStorage.getItem("userData"))
  const [events, setEvents] = useState([])
  const [regevents, setRegEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [filtered, setFiltered] = useState([])
  const [qrCodes, setQrCodes] = useState({}) // Store QR codes by eventId
  if (!user) {
    return <Navigate to="/login" />
  }
  if (user.role !== 'participant') {
    if (user.role === 'organizer') {
      return <Navigate to="/organizerdashboard" />
    }
    return <Navigate to="/admindashboard" />
  }
  const getUpcomingEvents = async () => {
    try {
      const response = await api.get('/api/registration/getUpcomingEvents');
      console.log(response.data.events);
      setEvents(response.data.events);
    } catch (error) {
      alert("Error fetching upcoming events" + error.message);
    }
  }
  const getRegisteredEvents = async () => {
    try {
      const response = await api.get('/api/registration/getRegisteredEvents')
      setRegEvents(response.data.events)
    }
    catch (error) {
      alert("Error fetching events" + error.message)
    }
  }
  useEffect(() => {
    getUpcomingEvents()
    getRegisteredEvents()
  }, [])

  useEffect(() => {
    setFiltered(regevents)
  }, [regevents])
  const handleeventclick = (eventId) => {
    window.location.href = `/participanteventview/${eventId}`;
  }
  const getTicket = async (eventId) => {
    try {
      const response = await api.post('/api/registration/getRegistrationTicket', { eventId: eventId })
      setQrCodes({ ...qrCodes, [eventId]: response.data.qrcode });
    }
    catch (error) {
      alert("Error fetching ticket" + error.message)
    }
  }
  const filterevent = (e) => {
    if (e.target.value === "normal") {
      const temp = regevents.filter(event => event.eventType === "normal")
      setFiltered(temp)
    }
    else if (e.target.value === "merchandise") {
      const temp = regevents.filter(event => event.eventType === "merchandise")
      setFiltered(temp)
    }
    else if (e.target.value === "completed") {
      const temp = regevents.filter(event => event.eventStatus === "completed")
      setFiltered(temp)
    }
    else if (e.target.value === "cancelled") {
      const temp = regevents.filter(event => event.eventStatus === "cancelled")
      setFiltered(temp)
    }
    else if (e.target.value === "rejected") {
      const temp = regevents.filter(event => event.registrationStatus === "Rejected")
      setFiltered(temp)
    }
    else if (e.target.value === "all") {
      setFiltered(regevents)
    }
  }
  return (
    <div>
      <h2>Upcoming Events</h2>
      {events.map((event) => (
        <div key={event._id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
          <h3>{event.eventName}</h3>
          <p><strong>Organizer:</strong> {event.organizerId?.organizername || 'Unknown'}</p>
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
          <button onClick={() => getTicket(event._id)}> Get Ticket</button>
          {qrCodes[event._id] && <div><br /><img src={qrCodes[event._id]} alt="QR Code" style={{ width: '200px', height: '200px' }} /></div>}


        </div>

      ))}
      <h2>Registered Events</h2>
      <label>Filter by other categories</label>
      <select onChange={filterevent}>
        <option value="all">All Events</option>
        <option value="normal">Normal</option>
        <option value="merchandise">Merchandise</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="rejected">Rejected</option>
      </select>
      {filtered.length === 0 ? <p>No events found</p> : filtered.map((event) => (
        <div key={event._id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
          <h3>{event.eventName}</h3>				{event.registrationStatus && event.registrationStatus !== 'Approved' && (
            <p><strong>Registration Status:</strong> <span style={{ color: event.registrationStatus === 'Rejected' ? 'red' : 'orange' }}>{event.registrationStatus}</span></p>
          )}          <p><strong>Organizer:</strong> {event.organizerId?.organizername || 'Unknown'}</p>
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
          <button onClick={() => getTicket(event._id)}> Get Ticket</button>
          {qrCodes[event._id] && <div><br /><img src={qrCodes[event._id]} alt="QR Code" style={{ width: '200px', height: '200px' }} /></div>}
        </div>

      ))}
    </div>
  )
};

export default ParticipantDashboard;    