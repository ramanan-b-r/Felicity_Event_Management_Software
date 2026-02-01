import { Navigate } from "react-router-dom"

const Clubs = () => {
  const user = JSON.parse(localStorage.getItem("userData"))
  if (user.role !== 'participant') {
    return <Navigate to="/" />
  }
  
  return (
    <div>
      <h1>Clubs / Organizers</h1>
      <p>Information about clubs and organizers.</p>
    </div>
  )
};

export default Clubs;
