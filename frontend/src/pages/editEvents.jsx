import React from 'react'
import { Navigate } from "react-router-dom"
import { useParams } from 'react-router-dom'
import  api from '../api/axiosmiddleware';
import { useEffect,useState } from 'react';
const editEvents = () => {
    
    const user = JSON.parse(localStorage.getItem("userData"))
    if (!user) {
      return <Navigate to="/" />
    }
    if(user.role !== "organizer"){
      return <Navigate to="/" />
    }
    const parameters = useParams();
    const eventId = parameters.eventId;
    const fetcheventdetails = async (eventId) => {
        try{
            const response = await api.get(`/api/events/getEventbyId/${eventId}`);
            console.log(response.data.event);
        }
        catch(error){
            console.log("Error fetching event details:", error);
        }
    }
    useEffect(() => {
        fetcheventdetails(eventId);
    }, []);
    return (
        <div>
            Edit Events Page
        </div>
    )
}
export default editEvents;