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
        //backend ensuring that normal events cannot have merchandise config and merchandise events cannot have form fields even if organizer tries to send it in the request body
        if(eventData.eventType === 'normal' && Object.keys(eventData.merchandiseConfig).length > 0){
            return res.status(400).json({message:"Normal events cannot have merchandise configuration"});
        }
        if(eventData.eventType === 'merchandise' && eventData.formFields.length>0){
            return res.status(400).json({message:"Merchandise events cannot have form fields"});
        }
        
        if(eventData.eventType === 'merchandise' && eventData.merchandiseConfig && eventData.merchandiseConfig.stock) {
            eventData.merchandiseConfig.itemsRemaining = eventData.merchandiseConfig.stock;
        }
        
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
        
        // Backend security: ensure event type consistency regardless of status
        if(event.eventType=='normal' && req.body.merchandiseConfig && Object.keys(req.body.merchandiseConfig).length > 0){
            return res.status(400).json({message:"Normal events cannot have merchandise configuration"});
        }
        if(event.eventType=='merchandise' && req.body.formFields && req.body.formFields.length > 0){
            return res.status(400).json({message:"Merchandise events cannot have form fields"});
        }
        
        const currentStatus = event.eventStatus;
        const newStatus = req.body.eventStatus;
        
        if((currentStatus === 'published' || currentStatus === 'ongoing' || currentStatus === 'closed' || currentStatus === 'completed') && newStatus === 'draft'){
            return res.status(400).json({message:"Cannot change back to draft once published"});
        }
        
        // Create update object based on current status
        let allowedUpdates = {};
        
        if(currentStatus === 'draft') {
            // Draft: Free edits, can be published
            allowedUpdates = {...req.body};
        }
        else if(currentStatus === 'published') {
            // Published: Only description, deadline, limit, close registrations and stock
            if(req.body.eventDescription) allowedUpdates.eventDescription = req.body.eventDescription;
            if(req.body.registrationDeadline) allowedUpdates.registrationDeadline = req.body.registrationDeadline;
            if(req.body.registrationLimit && req.body.registrationLimit >= event.registeredCount) {
                allowedUpdates.registrationLimit = req.body.registrationLimit;
            }
            if(req.body.eventStatus) allowedUpdates.eventStatus = req.body.eventStatus;
            
            // Allow stock updates for merchandise events
            if(event.eventType === 'merchandise' && req.body.merchandiseConfig) {
                if(req.body.merchandiseConfig.stock !== undefined) {
                    allowedUpdates.merchandiseConfig = allowedUpdates.merchandiseConfig || {};
                    allowedUpdates.merchandiseConfig.stock = req.body.merchandiseConfig.stock;
                }
            }
            
            if(req.body.formFields && JSON.stringify(event.formFields) !== JSON.stringify(req.body.formFields) && event.registeredCount > 0){
                return res.status(400).json({message:"Cannot change form fields after participants have registered"});
            }
            if(req.body.formFields && event.registeredCount === 0) allowedUpdates.formFields = req.body.formFields;
        }
        else if(['ongoing', 'completed', 'closed'].includes(currentStatus)) {
            if(req.body.eventStatus) allowedUpdates.eventStatus = req.body.eventStatus;
        }
        
        if(event.eventType === 'merchandise' && allowedUpdates.merchandiseConfig && allowedUpdates.merchandiseConfig.stock !== undefined) {
            const currentStock = event.merchandiseConfig?.stock || 0;
            const currentRemaining = event.merchandiseConfig?.itemsRemaining || 0;
            const newStock = parseInt(allowedUpdates.merchandiseConfig.stock);
            
            console.log(`Stock update: current=${currentStock}, remaining=${currentRemaining}, new=${newStock}`);
            
            // Calculate items sold (stock - remaining)
            const itemsSold = currentStock - currentRemaining;
            console.log(`Items sold: ${itemsSold}`);
            
            // Validate new stock is not less than items already sold
            if(newStock < itemsSold) {
                return res.status(400).json({
                    message: `Cannot reduce stock below ${itemsSold} items. ${itemsSold} items have already been sold.`
                });
            }
            
            // Calculate new itemsRemaining
            const newItemsRemaining = newStock - itemsSold;
            console.log(`New items remaining: ${newItemsRemaining}`);
            
            allowedUpdates.merchandiseConfig = {
                ...event.merchandiseConfig.toObject(),
                stock: newStock,
                itemsRemaining: newItemsRemaining
            };
        }
        
        const updatedEvent = await Event.findByIdAndUpdate(eventId, allowedUpdates, { new: true });
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

// Get events by organizer for participants
router.get('/getEventsByOrganizerForParticipant/:organizerId', authMiddleware, async (req,res)=>{
    if(req.user.role !== 'participant'){
        return res.status(403).json({message:"Only participants can view organizer events"});
    }
    const { organizerId } = req.params;
    try{
        // Check if organizer exists
        const organizer = await User.findById(organizerId);
        if(!organizer || organizer.role !== 'organizer'){
            return res.status(404).json({message:"Organizer not found"});
        }
        
        let query = { organizerId: organizerId };
        
        // Only show published events to participants
        query.eventStatus = 'published';
        
        // Add eligibility filter for participants
        const user = await User.findById(req.user.id);
        const userType = (user.participanttype || '').toLowerCase();
        if(userType === 'iiit'){
            query.$or = [{eligibility: {$regex: '^all$', $options: 'i'}}, {eligibility: {$regex: '^iiit$', $options: 'i'}}];
        } else if(userType === 'non-iiit'){
            query.$or = [{eligibility: {$regex: '^all$', $options: 'i'}}, {eligibility: {$regex: '^non-iiit$', $options: 'i'}}];
        }
        
        const events = await Event.find(query);
        return res.status(200).json({events:events});
    }
    catch(error){
        return res.status(500).json({message:"Server error",error:error.message});
    }
});

// Export participants as CSV
router.get('/exportParticipants/:eventId', authMiddleware, async (req, res) => {
    if(req.user.role !== 'organizer') {
        return res.status(403).json({message:"Only organizers can export participant data"});
    }
    
    const { eventId } = req.params;
    
    try {
        const event = await Event.findById(eventId);
        if(!event) {
            return res.status(404).json({message:"Event not found"});
        }
        if(event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({message:"Access denied"});
        }
        
        const registrations = await Registration.find({eventId: eventId})
            .populate('participantId', 'firstName lastName email participanttype')
            .sort({createdAt: 1});
        
        if(registrations.length === 0) {
            return res.status(404).json({message:"No participants found"});
        }
        
        // Generate CSV headers
        const headers = ['Name', 'Email', 'Registration Date', 'Payment Status', 'Participant Type', 'Attendance'];
        
        // Add dynamic form field headers if present
        let formFieldLabels = [];
        if(event.formFields && event.formFields.length > 0) {
            formFieldLabels = event.formFields.map(field => field.label);
            headers.push(...formFieldLabels);
        }
        
        // Add merchandise selection header if merchandise event
        if(event.eventType === 'merchandise') {
            headers.push('Merchandise Selection');
        }
        
        // Generate CSV rows
        const csvRows = [headers.join(',')];
        
        registrations.forEach(registration => {
            const participant = registration.participantId;
            const name = `"${participant.firstName} ${participant.lastName}"`;
            const email = participant.email;
            const regDate = new Date(registration.createdAt).toLocaleDateString();
            const paymentStatus = registration.formData?.paymentStatus || 'Pending';
            const participantType = participant.participanttype || 'N/A';
            const attendance = registration.hasattended ? 'Present' : 'Absent';
            
            let row = [name, email, regDate, paymentStatus, participantType, attendance];
            
            // Add form field responses
            if(formFieldLabels.length > 0) {
                formFieldLabels.forEach(label => {
                    const value = registration.formData?.[label] || 'N/A';
                    row.push(`"${value}"`);
                });
            }
            
            // Add merchandise selection
            if(event.eventType === 'merchandise') {
                const merchSelection = registration.merchandiseSelection ? 
                    JSON.stringify(registration.merchandiseSelection) : 'N/A';
                row.push(`"${merchSelection}"`);
            }
            
            csvRows.push(row.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${event.eventName}_participants.csv"`);
        
        return res.send(csvContent);
        
    } catch(error) {
        console.error("CSV export error:", error);
        return res.status(500).json({message:"Server error", error: error.message});
    }
});

router.get('/getAggregateAnalytics', authMiddleware, async (req, res) => {
    if(req.user.role !== 'organizer') {
        return res.status(403).json({message: "Only organizers can view analytics"});
    }
    try {
        const events = await Event.find({organizerId: req.user.id, eventStatus: 'completed'});
        const Registration = require('../models/Registration');
        
        let totalRegistrations = 0;
        let totalRevenue = 0;
        let totalAttendance = 0;
        let totalUnitsSold = 0;
        
        for(const event of events) {
            const registrations = await Registration.find({eventId: event._id});
            totalRegistrations += registrations.length;
            
            if(event.eventType === 'normal') {
                totalRevenue += registrations.length * event.registrationFee;
            } else if(event.eventType === 'merchandise') {
                for(const reg of registrations) {
                    if(reg.merchandiseSelection && reg.merchandiseSelection.length > 0) {
                        totalUnitsSold += reg.merchandiseSelection.length;
                        totalRevenue += reg.merchandiseSelection.length * event.merchandiseConfig.price;
                    }
                }
            }
            
            const attendedCount = registrations.filter(r => r.hasattended).length;
            totalAttendance += attendedCount;
        }
        
        res.status(200).json({
            totalRegistrations,
            totalRevenue,
            totalAttendance,
            totalUnitsSold,
            completedEvents: events.length
        });
    } catch(error) {
        res.status(500).json({message: "Server error"});
    }
});

module.exports = router;