
import {useParams} from 'react-router-dom';
import api from '../api/axiosmiddleware';
import {useState,useEffect} from "react"
const ParticipantEventView = () => {
    const user = JSON.parse(localStorage.getItem('userData'));
    if(user.role !== 'participant'){
        window.location.href = '/';
    }
  const { eventId } = useParams();
  const [event, setEvent] = useState({});
  const [formData, setFormData] = useState({});
  const getEventDetails = async () => {
    try {
      const response = await api.get(`/api/events/getEvent/${eventId}`);
      const eventDetails = response.data.events;
      setEvent(eventDetails);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getEventDetails();
  }, []); 

  const handleInputChange = (fieldLabel, value) => {
    setFormData({...formData, [fieldLabel]: value});
  };

  const handleSubmit = async () => {
    try {
      const response = await api.put('/api/registration/eventRegistration', {eventId, formData});
      alert(`Registration submitted! ${response.data.message}`);
    } catch (error) {
      alert(error.response.data.message );

      console.log(error);
    }
  };

  const renderField = (field) => {
    if(field.type === 'text') {
      return <input type="text" onChange={(e) => handleInputChange(field.label, e.target.value)} />;
    }
    if(field.type === 'number') {
      return <input type="number" onChange={(e) => handleInputChange(field.label, e.target.value)} />;
    }
    if(field.type === 'dropdown') {
      return (
        <select onChange={(e) => handleInputChange(field.label, e.target.value)}>
          <option value="">Select...</option>
          {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if(field.type === 'checkbox') {
      return (
        <div>
          {field.options.map((opt, i) => (
            <label key={i}>
              <input type="checkbox" onChange={(e) => {
                const current = formData[field.label] || [];
                if(e.target.checked) {
                  handleInputChange(field.label, [...current, opt]);
                } else {
                  handleInputChange(field.label, current.filter(x => x !== opt));
                }
              }} /> {opt}
            </label>
          ))}
        </div>
      );
    }
  };

  if(event.eventType==='normal'){
    return (
      <div>
        <h1>{event.eventName}</h1>
        <p>{event.eventDescription}</p>
        <p><strong>Eligibility:</strong> {event.eligibility}</p>
        <p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
        <p><strong>Event Dates:</strong> {new Date(event.eventStartDate).toLocaleDateString()} - {new Date(event.eventEndDate).toLocaleDateString()}</p>
        <p><strong>Registration Fee:</strong> ₹{event.registrationFee}</p>
        <p><strong>Tags:</strong> {event.eventTags?.join(', ') || 'None'}</p>
        <p><strong>Event Category:</strong> {event.eventCategory}</p>
        
        <h2>Registration Form</h2>
        {event.formFields && event.formFields.length > 0 ? (
          <div>
            {event.formFields.map((field, index) => (
              <div key={index}>
                <label><strong>{field.label}:</strong> {field.required && '*'}</label>
                {renderField(field)}
              </div>
            ))}
            <button onClick={handleSubmit}>Register</button>
          </div>
        ) : (
          <button onClick={handleSubmit}>Register</button>
        )}
      </div>
    );
  }   
  else if(event.eventType==='merchandise'){
    return (
      <div></div>
    );
  }
  
};

export default ParticipantEventView;