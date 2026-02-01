import { Navigate } from "react-router-dom"
import { useState } from "react"
import { useNavigate } from "react-router-dom"; 
import api from '../api/axiosmiddleware';
const CreateEvent = () => {
  const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("userData"))
   const [formData, setFormData] = useState({
    eventName: "",
    eventType: "normal",
    eventStartDate: "",
    eventEndDate: "",
    eventStatus: "draft",
    eligibility: "All are eligible",
    registrationDeadline: "",
    registrationLimit: 0,
    registrationFee: 0,
    eventTags: [],
    formFields: [],
    merchandiseConfig: {},
    eventDescription: "Fill Description Here",
  })
  if (!user) {
    return <Navigate to="/" />
  }
  if(user.role !== "organizer"){
    return <Navigate to="/" />
  }
 
  
  const changeName = (e) =>{
    setFormData({...formData, eventName: e.target.value});

  }
  const changeType = (e) =>{
    setFormData({...formData, eventType: e.target.value});
  }
  const changeStartDate = (e) =>{
    setFormData({...formData, eventStartDate: e.target.value});
  }
  const changeEndDate = (e) =>{   
    setFormData({...formData, eventEndDate: e.target.value});
  }
  const createEventDraft = async () => {
    try{
      formData.registrationDeadline = new Date(formData.eventStartDate);
      const response = await api.put('/api/events/createEvent',formData)
      const eventid = response.data.eventId
      navigate(`/editevent/${eventid}`);
    }
    catch(error){
      console.log("Error creating event draft:", error);
    }

  }
  return (
    <div>
      <input placeholder="Enter Event Name" onChange={changeName}></input>
      <br/>
      <select onChange={changeType}>
        <option value="normal">Normal</option>
        <option value="merchandise">Merchandise</option>
      </select>
      <br/>
      <label>Event Start Date</label>
      <br/>
      <input type="date" onChange={changeStartDate}></input>
      <br/>
      <label>Event End Date</label>
      <br/>
      <input type="date" onChange={changeEndDate}></input>
      <br/>
      <button onClick={createEventDraft}> Create Event Draft</button>

    </div>
  )
}

export default CreateEvent