const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Registration = require('../models/Registration');
const jwt  = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
router.put('/createEvent',authMiddleware,async (req,res)=>{
    if(req.user.role !=='organizer'){
        return res.status(403).json({message:"Only organizers can create events"});
    }
    try{
        const organizer = await User.findById(req.user.id);
        const eventData = {...req.body, organizerId: req.user.id,eventCategory: organizer.category};
        const event = new Event(eventData);
        await event.save();
        return res.status(200).json({eventId: event._id});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:"Server error",error: err.message});
    }
});

//this is open for all endpoint particpant and organizer
router.get('/getEventbyId/:eventId',authMiddleware,async (req,res)=>{

    const eventId = req.params.eventId;
    try{
        const event = await Event.findById(eventId);
        if(!event){
            return res.status(404).json({message:"Event not found"});
        }
        if(req.user.role === 'participant' && event.eventStatus !== 'published'){
            return res.status(403).json({message:"Event is not published yet"});
        }
        
        // Check eligibility for participants
        if(req.user.role === 'participant'){
            const user = await User.findById(req.user.id);
            const eventEligibility = (event.eligibility || '').toLowerCase();
            const userType = (user.participanttype || '').toLowerCase();
            if(eventEligibility === 'iiit' && userType !== 'iiit'){
                return res.status(403).json({message:"This event is only for IIIT students"});
            }
            if(eventEligibility === 'non-iiit' && userType !== 'non-iiit'){
                return res.status(403).json({message:"This event is only for Non-IIIT participants"});
            }
        }
        
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
        const currentStatus = event.eventStatus;
        const newStatus = req.body.eventStatus;
        if((currentStatus === 'published' || currentStatus === 'ongoing' || currentStatus === 'closed' || currentStatus === 'completed') && newStatus === 'draft'){
            return res.status(400).json({message:"Cannot change back to draft once published"});
        }
        if(['completed', 'ongoing', 'closed'].includes(currentStatus)){
            const allowedUpdates = {eventStatus: req.body.eventStatus};
            const updatedEvent = await Event.findByIdAndUpdate(eventId, allowedUpdates, { new: true });
            return res.status(200).json({message:"Event updated successfully", event: updatedEvent});
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
router.post('/getAllEvents',authMiddleware,async (req,res)=>{
    try{    
            let query = {};
            if(req.user.role === 'participant'){
                query.eventStatus = 'published';
                
                // Add eligibility filter for participants
                const user = await User.findById(req.user.id);
                const userType = (user.participanttype || '').toLowerCase();
                if(userType === 'iiit'){
                    query.$or = [{eligibility: {$regex: '^all$', $options: 'i'}}, {eligibility: {$regex: '^iiit$', $options: 'i'}}];
                } else if(userType === 'non-iiit'){
                    query.$or = [{eligibility: {$regex: '^all$', $options: 'i'}}, {eligibility: {$regex: '^non-iiit$', $options: 'i'}}];
                }
            }
            if(req.body.filters ===""){
                    const events = await Event.find(query);
                    return res.status(200).json({events:events})


            }
            else{
                const q = req.body.filters;
                const events = await Event.find({
                        ...query,
                        $or: [
                            { eventName: { $regex: q, $options: "i" } },
                            { eventTags: { $regex: q, $options: "i" } }
                        ]
                });
                return res.status(200).json({events:events})
            }
    }
    catch(error){
        return res.status(500).json({message:"Server error",error:error.message})
    }
});

router.get('/getEvent/:eventId',authMiddleware,async (req,res)=>{

    if(req.user.role !== 'participant'){
        return res.status(403).json({message:"Only participants can access events by category"});
    }
    try{
        const events = await Event.findById(req.params.eventId);
        if(!events){
            return res.status(404).json({message:"Event not found"});
        }
        if(events.eventStatus !== 'published'){
            return res.status(403).json({message:"Event is not published yet"});
        }
        
        // Check eligibility
        const user = await User.findById(req.user.id);
        const eventEligibility = (events.eligibility || '').toLowerCase();
        const userType = (user.participanttype || '').toLowerCase();
        if(eventEligibility === 'iiit' && userType !== 'iiit'){
            return res.status(403).json({message:"This event is only for IIIT students"});
        }
        if(eventEligibility === 'non-iiit' && userType !== 'non-iiit'){
            return res.status(403).json({message:"This event is only for Non-IIIT participants"});
        }
        
        return res.status(200).json({events:events});
    }
    catch(err){
        return res.status(500).json({message:"Server error",error: err.message});
    }   
});

module.exports = router;