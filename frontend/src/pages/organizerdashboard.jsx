import { Navigate } from "react-router-dom"

const OrganizerDashboard = () => {
  const user = JSON.parse(localStorage.getItem("userData"))
  if (!user) {
    return <Navigate to="/login" />
  }
  if(user.role !== 'organizer'){
    if(user.role ==='participant'){
      return <Navigate to="/participantdashboard" />
    }
    return <Navigate to="/" />
  }
  
  return (
    <div>
      <h1>Organizer Dashboard</h1>
      <p>Welcome to the organizer dashboard.</p>
    </div>
  )
}

export default OrganizerDashboard;