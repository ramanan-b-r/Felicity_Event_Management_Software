import { Navigate, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import api from '../api/axiosmiddleware'

const OrganizerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("userData"))
  const [events, setEvents] = useState([])
  const [analytics, setAnalytics] = useState(null)

  if (!user) {
    return <Navigate to="/login" />
  }
  if (user.role !== 'organizer') {
    if (user.role === 'participant') {
      return <Navigate to="/participantdashboard" />
    }
    return <Navigate to="/" />
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await api.get('/api/events/getEventsByOrganizer')
        setEvents(eventsResponse.data.events || [])

        const analyticsResponse = await api.get('/api/events/getAggregateAnalytics')
        setAnalytics(analyticsResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      <h1>Organizer Dashboard</h1>

      {analytics && (
        <div style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
          <h2>Aggregate Analytics (Completed Events)</h2>
          <p><strong>Total Completed Events:</strong> {analytics.completedEvents}</p>
          <p><strong>Total Registrations:</strong> {analytics.totalRegistrations}</p>
          <p><strong>Total Revenue:</strong> ₹{analytics.totalRevenue}</p>
          <p><strong>Total Attendance:</strong> {analytics.totalAttendance}</p>
          {analytics.totalUnitsSold > 0 && <p><strong>Total Units Sold:</strong> {analytics.totalUnitsSold}</p>}
        </div>
      )}

      <h2>Your Events</h2>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        events.map((event) => (
          <div key={event._id} style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
            <h3>{event.eventName}</h3>
            <p><strong>Type:</strong> {event.eventType}</p>
            <p><strong>Status:</strong> {event.eventStatus}</p>
            <p><strong>Event Start Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}</p>
            <p><strong>Registered Count:</strong> {event.registeredCount}</p>
            <Link to={`/editevent/${event._id}`}>
              <button>Manage Event</button>
            </Link>
          </div>
        ))
      )}
    </div>
  )
}

export default OrganizerDashboard;