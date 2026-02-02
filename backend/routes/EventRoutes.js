const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt  = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
router.put('/createEvent',authMiddleware,async (req,res)=>{
    if(req.user.role !=='organizer'){
        return res.status(403).json({message:"Only organizers can create events"});
    }
    try{
        const eventData = {...req.body, organizerId: req.user.id};
        const event = new Event(eventData);
        await event.save();
        return res.status(200).json({eventId: event._id});
    }
    catch(err){
        return res.status(500).json({message:"Server error",error: err.message});
    }
});

//this is open for all endpoint particpant and organizer
router.get('/getEventbyId/:eventId',authMiddleware,async (req,res)=>{

    const eventId = req.params.eventId;
    try{
        const event = await Event.findById(eventId);
        return res.status(200).json({event});
    }
    catch(err){
        return res.status(500).json({message:"Server error",error: err.message});
    }   
});

router.put('/updateEvent/:eventId',authMiddleware,async (req,res)=>{
    const eventId = req.params.eventId;
    try{
        const event = await Event.findById(eventId);
        if(!event){
            return res.status(404).json({message:"Event not found"});
        }
        if(event.organizerId.toString() !== req.user.id){
            return res.status(403).json({message:"You are not authorized to update this event"});
        } 
        const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
        return res.status(200).json({message:"Event updated successfully", event: updatedEvent});
    }
    catch(err){
        return res.status(500).json({message:"Server error",error: err.message});
    }
});

//we may need to make this an open endpoint if needed
router.get('/getEventsByOrganizer',authMiddleware,async (req,res)=>{
    const userID = req.user.id;
    const role = req.user.role;
    if(role !== 'organizer'){
        return res.status(403).json({message:"Invalid authorization"});

    }
    try{
            const events = await Event.find({organizerId:userID})
            return res.status(200).json({events:events})

    }
    catch(error){
        return res.status(500).json({message:"Server error",error:error.message})
    }


});
//open endpoint for all users
router.get('/getAllEvents',authMiddleware,async (req,res)=>{
    try{
            const events = await Event.find({});
            return res.status(200).json({events:events})
    }
    catch(error){
        return res.status(500).json({message:"Server error",error:error.message})
    }
});

module.exports = router;