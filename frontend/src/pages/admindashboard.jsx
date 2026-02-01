import { Navigate } from "react-router-dom"; // Add this import

const AdminDashboard = () => {  
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) {
        return <Navigate to="/" />
    }
    if(user.role !== 'admin'){
      if(user.role ==='organizer'){
        return <Navigate to="/organizerdashboard" />
      }
      if(user.role ==='participant'){
        return <Navigate to="/participantdashboard" />
      }
      return <Navigate to="/" />
    }
    return (    
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome to the admin dashboard.</p>
        </div>
    )  
}
export default AdminDashboard;