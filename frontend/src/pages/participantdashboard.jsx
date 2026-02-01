import { Navigate } from "react-router-dom"

const ParticipantDashboard = () => {
    const user = JSON.parse(localStorage.getItem("userData"))
    if (!user) {
        return <Navigate to="/login" />
    }
    if(user.role !== 'participant'){
      if(user.role ==='organizer'){
        return <Navigate to="/organizerdashboard" />
      }
      return <Navigate to="/admindashboard" />
    }
    
    return (  
        <div>
        <h1>Welcome to the Dashboard</h1>
        <p>This is the main dashboard page.</p>
    </div>

    )
};
 
export default ParticipantDashboard;    