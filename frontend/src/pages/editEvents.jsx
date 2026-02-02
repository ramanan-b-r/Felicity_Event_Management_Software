import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import api from '../api/axiosmiddleware';
import FormBuilder from '../components/dynamicformbuild';
const EditEvents = () => {
    const { eventId } = useParams();
    const user = JSON.parse(localStorage.getItem("userData"));
    const [eventDetails, setEventDetails] = useState({
        eventName: "",
        eventType: "normal",
        eventStartDate: "",
        eventEndDate: "",
        eventStatus: "draft",
        eligibility: "All are eligible",
        registrationDeadline: "",
        registrationLimit: 0,
        registrationFee: 0,
        registeredCount: 0,
        eventTags: [],
        formFields: [],
        merchandiseConfig: {},
        eventDescription: "Fill Description Here",

    });

    if (!user) {
        return <Navigate to="/" />
    }
    if (user.role !== "organizer") {
        return <Navigate to="/" />
    }

    const fetchEventDetails = async () => {
        try {
            const response = await api.get(`/api/events/getEventbyId/${eventId}`);
            setEventDetails(response.data.event);
        } catch (error) {
            console.log("Error fetching event details:", error);
        } finally {
        }
    }
    const setFormFields = (newFields) => {
        setEventDetails({ ...eventDetails, formFields: newFields });
    };
    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const changeDetails = (e) => {
        setEventDetails({ ...eventDetails, [e.target.name]: e.target.value });
    }

    const handleTagChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        setEventDetails({ ...eventDetails, eventTags: tags });
    }

    const saveChanges = async () => {
        try {
            await api.put(`/api/events/updateEvent/${eventId}`, eventDetails);
            alert("Event updated successfully");
        } catch (error) {
            console.error("Error updating event:", error);
        }
    };  
    const needFormBuilder = ()=>{
        if(eventDetails.eventType !== 'normal'){
            return null;
        }
        return (
            <FormBuilder 
                    formFields={eventDetails.formFields} 
                    setFormFields={setFormFields} 
                    isLocked={eventDetails.registeredCount > 0} 
            />

        )
    };

    return (
        <div>
            <h2>Edit Event: {eventDetails.eventName}</h2>

            <label>Event Name</label>
            <input 
                name="eventName" 
                value={eventDetails.eventName} 
                onChange={changeDetails} 
            />
            <br />

            <label>Description</label>
            <textarea 
                name="eventDescription" 
                value={eventDetails.eventDescription} 
                onChange={changeDetails} 
            />
            <br />

            <label>Type</label>
            <select 
                name="eventType" 
                value={eventDetails.eventType} 
                onChange={changeDetails}
            >
                <option value="normal">Normal</option>
                <option value="merchandise">Merchandise</option>
            </select>
            <br />

            <label>Eligibility(All,IIIT,NON-IIIT)</label>
            <input 
                name="eligibility" 
                value={eventDetails.eligibility} 
                onChange={changeDetails} 
            />
            <br />

            <label>Registration Deadline</label>
            <input 
                type="datetime-local" 
                name="registrationDeadline" 
                value={eventDetails.registrationDeadline ? new Date(eventDetails.registrationDeadline).toISOString().slice(0, 16) : ''} 
                onChange={changeDetails} 
            />
            <br />

            <label>Start Date</label>
            <input 
                type="datetime-local" 
                name="eventStartDate" 
                value={eventDetails.eventStartDate ? new Date(eventDetails.eventStartDate).toISOString().slice(0, 16) : ''} 
                onChange={changeDetails} 
            />
            <br />

            <label>End Date</label>
            <input 
                type="datetime-local" 
                name="eventEndDate" 
                value={eventDetails.eventEndDate ? new Date(eventDetails.eventEndDate).toISOString().slice(0, 16) : ''} 
                onChange={changeDetails} 
            />
            <br />

            <label>Registration Limit</label>
            <input 
                type="number" 
                name="registrationLimit" 
                value={eventDetails.registrationLimit} 
                onChange={changeDetails} 
            />
            <br />

            <label>Registration Fee</label>
            <input 
                type="number" 
                name="registrationFee" 
                value={eventDetails.registrationFee} 
                onChange={changeDetails} 
            />
            <br />

            <label>Tags (comma separated)</label>
            <input 
                name="eventTags" 
                value={eventDetails.eventTags?.join(',')} 
                onChange={handleTagChange} 
            />
            <br />

            {needFormBuilder()}
            <button onClick={saveChanges}>Save Changes</button>
        </div>
    )
}

export default EditEvents;