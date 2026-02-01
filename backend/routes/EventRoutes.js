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

module.exports = router;