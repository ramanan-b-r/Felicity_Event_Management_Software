import { Navigate } from "react-router-dom"

const CreateEvent = () => {
  const user = JSON.parse(localStorage.getItem("userData"))
  if (!user) {
    return <Navigate to="/" />
  }
  if(user.role !== "organizer"){
    return <Navigate to="/" />
  }
  return (
    <div>
      <h1>Create Event</h1>
      <p>Create a new event form will go here.</p>
    </div>
  )
}

export default CreateEvent