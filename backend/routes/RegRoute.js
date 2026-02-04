

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Registration = require('../models/Registration');
const jwt  = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
router.put('/eventRegistration',authMiddleware,async (req,res)=>{

    if(req.user.role !== 'participant'){
        return res.status(403).json({message:"Only participants can register for events"});
    }
    try{
        const registration = await Registration.findOne({participantId: req.user.id,eventId: req.body.eventId});
        if(registration){
            return res.status(400).json({message:"Participant has already registered for an event"});
        }
    }
    catch(err){
        return res.status(500).json({message:"server error",error: err.message});
    }
    try{
        const event = await Event.findById(req.body.eventId);
        if(event.registrationDeadline < new Date()){
            return res.status(400).json({message:"Registration deadline has passed"});
        }
    }
    catch(err){
        return res.status(404).json({message:"err"});
    }
    try{
        const { eventId, formData } = req.body;
        try{
            const  event = await Event.findById(eventId);
            if(!event){
                return res.status(404).json({message:"Event not found"});
            }
            if(event.registeredCount >= event.registrationLimit){
                return res.status(400).json({message:"Registration limit reached"});
            }
            event.registeredCount += 1;
            await event.save();  
        }
        catch(err){
            return res.status(404).json({message:"Event not found"});
        }
        const registration = new Registration({
            eventId,
            participantId: req.user.id,
            formData
        });
        await registration.save();
        return res.status(200).json({message:" successful"});
    }
    catch(err){
        return res.status(500).json({message:"server error",error: err.message});
    }   
});
module.exports = router;