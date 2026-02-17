
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Registration = require('../models/Registration');
const jwt  = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const QRCode = require('qrcode');
const multer = require('multer');

dotenv.config();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: error.message });
    } else if (error) {
        return res.status(400).json({ message: error.message });
    }
    next();
};


const sendConfirmationEmail = async (userEmail, ticket_id, eventName = "Event") => {
    try{
         const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_ID, 
            pass: process.env.GMAIL_PASSWORD   
        }
        });
        const qrBuffer = await QRCode.toBuffer(ticket_id);
        const mailOptions = {
                from: `"Event Management Team" <${process.env.GMAIL_ID}>`,
                to: userEmail,
                subject: `Your Event Ticket - ${eventName}`,
                html: `
                    <h2>Registration Confirmed!</h2>
                    <p>You are registered for: <strong>${eventName}</strong></p>
                    <p>Your Ticket ID is: <strong>${ticket_id}</strong></p>
                    <p>Scan this QR code at the entrance:</p>
                    <br/>
                    <img src="cid:ticket-qr-code" alt="QR Code" width="200" style="width:200px; height:200px;"/>
                `,
                attachments: [
                    {
                        filename: 'ticket.png',
                        content: qrBuffer,
                        cid: 'ticket-qr-code'
                    }
                ]
            };
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.error("Error sending email:", err);
            }
            else{
                console.log("Email sent successfully:", info.response);
            }
        });

    }
    catch(err){
        console.error("Error", err);
    }
   
}

const sendRejectionEmail = async (userEmail, eventName, reason = "Payment verification failed") => {
    try{
         const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_ID, 
            pass: process.env.GMAIL_PASSWORD   
        }
        });
        const mailOptions = {
                from: `"Event Management Team" <${process.env.GMAIL_ID}>`,
                to: userEmail,
                subject: `Registration Update - ${eventName}`,
                html: `
                    <h2>Registration Update</h2>
                    <p>We're sorry to inform you that your registration for <strong>${eventName}</strong> has been rejected.</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p>If you believe this is an error, please contact the event organizers.</p>
                    <p>Thank you for your understanding.</p>
                `,
            };
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.error("Error sending rejection email:", err);
            }
            else{
                console.log("Rejection email sent successfully:", info.response);
            }
        });

    }
    catch(err){
        console.error("Error sending rejection email:", err);
    }
}
router.put('/eventRegistration', authMiddleware, upload.single('paymentProof'), handleMulterError, async (req,res)=>{

    if(req.user.role !== 'participant'){
        return res.status(403).json({message:"Only participants can register for events"});
    }
    // Check if the participant has already registered for the event
    try{
        const registration = await Registration.findOne({participantId: req.user.id,eventId: req.body.eventId});
        if(registration){
            return res.status(400).json({message:"Participant has already registered for an event"});
        }
    }
    catch(err){
        return res.status(500).json({message:"server error",error: err.message});
    }
    // Check if the event exists and if the registration deadline has passed
    try{
        const event = await Event.findById(req.body.eventId);
        if(!event){
            return res.status(404).json({message:"Event not found"});
        }
        if(event.eventStatus === 'draft'){
            return res.status(400).json({message:"Event is not published yet"});
        }
        if(event.eventStatus === 'closed'){
            return res.status(400).json({message:"Event registration is closed"});
        }
        if(event.eventStatus === 'ongoing'){
            return res.status(400).json({message:"Event is already ongoing, registration closed"});
        }
        if(event.eventStatus === 'completed'){
            return res.status(400).json({message:"Event has been completed"});
        }
        
        // Check eligibility
        const user = await User.findById(req.user.id);
        const eventEligibility = (event.eligibility || '').toLowerCase();
        const userType = (user.participanttype || '').toLowerCase();
        if(eventEligibility === 'iiit' && userType !== 'iiit'){
            return res.status(403).json({message:"This event is only for IIIT students"});
        }
        if(eventEligibility === 'non-iiit' && userType !== 'non-iiit'){
            return res.status(403).json({message:"This event is only for Non-IIIT participants"});
        }
        
        if(event.registrationDeadline < new Date()){
            return res.status(400).json({message:"Registration deadline has passed"});
        }
    }
    catch(err){
        return res.status(404).json({message:"err"});
    }
    try{
        let { eventId, selectedVariants } = req.body;
        let formData = null;
        
        if (typeof selectedVariants === 'string') {
            selectedVariants = JSON.parse(selectedVariants);
        }
        // Only parse formData for non-merchandise events
        if (req.body.formData && typeof req.body.formData === 'string') {
            formData = JSON.parse(req.body.formData);
        } else if (req.body.formData) {
            formData = req.body.formData;
        }
        
        try{
            const event = await Event.findById(eventId);
            if(!event){
                return res.status(404).json({message:"Event not found"});
            }
            if(event.status==='draft'){
                return res.status(400).json({message:"Event is not published yet"});
            }
            if(event.registeredCount >= event.registrationLimit){
                return res.status(400).json({message:"Registration limit reached"});
            }
            
            if(event.eventType === 'merchandise') {
                if (!req.file) {
                    return res.status(400).json({message:"Payment proof is required for merchandise orders"});
                }
                
                if (selectedVariants && selectedVariants.length > 0) {
                    const purchaseLimit = event.merchandiseConfig?.purchaseLimit;
                    
                    if(selectedVariants.length > purchaseLimit) {
                        return res.status(400).json({message:`Cannot select more than ${purchaseLimit} items`});
                    }
                    
                    const itemsRemaining = event.merchandiseConfig.itemsRemaining;
                    if(selectedVariants.length > itemsRemaining) {
                        return res.status(400).json({message:`Only ${itemsRemaining} items available in stock`});
                    }
                    
                    event.merchandiseConfig.itemsRemaining -= selectedVariants.length;
                }
            }
            
            event.registeredCount += 1;
            await event.save();  
        }
        catch(err){
            return res.status(404).json({message:"Event not found"});
        }

        const registrationData = {
            eventId,
            participantId: req.user.id
        };
        
        // Handle data based on event type
        const event = await Event.findById(eventId);
        if(event.eventType === 'merchandise') {
            registrationData.merchandiseSelection = selectedVariants;
            registrationData.status = 'Pending';
            if (req.file) {
                registrationData.paymentProof = req.file.buffer;
            }
        } else {
            registrationData.formData = formData;
            registrationData.status = 'Approved';
        }

        const registration = new Registration(registrationData);
        await registration.save();
        const user = await User.findById(req.user.id);
        const useremail = user.email;
        
        // Only send confirmation email for non-merchandise events or approved registrations
        if(event.eventType !== 'merchandise') {
            sendConfirmationEmail(useremail, registration.ticketID.toString(), event.eventName);
        }
        
        const message = event.eventType === 'merchandise' 
            ? "Registration submitted! Your order is pending payment verification by the organizer." 
            : "Registration successful!";
            
        return res.status(200).json({message: message});
    }
    catch(err){
        return res.status(500).json({message:"server error",error: err.message});
    }   
});

router.get('/getUpcomingEvents',authMiddleware,async (req,res)=>{
    const user = req.user;
    const userid = req.user.id
    if(user.role !== 'participant'){    
        return res.status(403).json({message:"Only participants can view upcoming events"});
    }
    try{
            const registrations = await Registration.find({participantId: userid}).populate({
                path: 'eventId',
                populate: { path: 'organizerId', select: 'organizername' }
            });
            //filter first on eventstardat4e and nicely send the events to frotnend not registration object os frontend code is similar
            const upcomingEvents = registrations.filter(reg => new Date(reg.eventId.eventStartDate) > new Date()).map(reg => reg.eventId);
            console.log(registrations);
            return res.status(200).json({events: upcomingEvents});
    }   
    catch(error){
        return res.status(500).json({message:"server error",error: error.message});
    }


})
router.get('/getRegisteredEvents',authMiddleware,async (req,res)=>{
    const user = req.user;
    const userid = req.user.id
    if(user.role !== 'participant'){    
        return res.status(403).json({message:"Only participants can view registered events"});
    }
    try{
            const registrations = await Registration.find({participantId: userid}).populate({
                path: 'eventId',
                populate: { path: 'organizerId', select: 'organizername' }
            });
            //filter first on eventstardat4e and nicely send the events to frotnend not registration object os frontend code is similar
            const registeredEvents = registrations.map(reg => reg.eventId);
            console.log(registrations);
            return res.status(200).json({events: registeredEvents});
    }   
    catch(error){
        return res.status(500).json({message:"server error",error: error.message});
    }

})  

router.post('/getRegistrationTicket',authMiddleware,async(req,res)=>{
    const user = req.user
    const userid = req.user.id
    if(user.role!=='participant'){
                return res.status(403).json({message:"Only participants can view registered events"});

    }
    try{
        const eventid = req.body.eventId
        const registration = await Registration.findOne({eventId:eventid,participantId:userid}).populate('eventId')
        if(!registration){
            return res.status(404).json({message:"Registration not found"});
        }
        
        // Check if registration is approved (only approved registrations get QR codes)
        if(registration.status !== 'Approved'){
            return res.status(400).json({message:`Your registration is ${registration.status}. QR code is only available for approved registrations.`});
        }
        
        const qrcode = await QRCode.toDataURL(registration.ticketID);
        return res.status(200).json({ticketID: registration.ticketID,qrcode:qrcode});




    }
    catch(error){
        return res.status(500).json({message:"server error",error: error.message});
    }
})

// Get event registrations for organizer
router.get('/getEventRegistrations/:eventId', authMiddleware, async (req, res) => {
    if(req.user.role !== 'organizer') {
        return res.status(403).json({message: "Only organizers can view registrations"});
    }
    const { eventId } = req.params;
    try {
        const event = await Event.findById(eventId);
        if(!event || event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({message: "Access denied"});
        }
        
        const registrations = await Registration.find({eventId: eventId}).populate('eventId');
        const participants = [];
        
        for(let reg of registrations) {
            const user = await User.findById(reg.participantId);
            participants.push({
                registrationId: reg._id,
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                formData: reg.formData || {},
                merchandiseSelection: reg.merchandiseSelection || [],
                registeredAt: reg.createdAt,
                status: reg.status || 'Approved',
                hasPaymentProof: !!reg.paymentProof,
                hasAttended: reg.hasattended,
                attendedAt: reg.attendanceTimestamps
            });
        }
        
        res.status(200).json({participants});
    } catch(error) {
        res.status(500).json({message: "Server error"});
    }
});

router.get('/getPaymentProof/:registrationId', authMiddleware, async (req, res) => {
    if(req.user.role !== 'organizer') {
        return res.status(403).json({message: "Only organizers can view payment proofs"});
    }
    
    const { registrationId } = req.params;
    
    try {
        const registration = await Registration.findById(registrationId).populate('eventId');
        if(!registration) {
            return res.status(404).json({message: "Registration not found"});
        }
        
        const event = registration.eventId;
        if(event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({message: "Access denied"});
        }
        
        if(!registration.paymentProof) {
            return res.status(404).json({message: "No payment proof found"});
        }
        
        res.set('Content-Type', 'image/jpeg');
        res.send(registration.paymentProof);
    } catch(error) {
        return res.status(500).json({message: "Server error", error: error.message});
    }
});

router.get('/getEventAnalytics/:eventId', authMiddleware, async (req, res) => {
    if(req.user.role !== 'organizer') {
        return res.status(403).json({message: "Only organizers can view analytics"});
    }
    const { eventId } = req.params;
    try {
        const event = await Event.findById(eventId);
        if(!event || event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({message: "Access denied"});
        }
        if(event.eventType === 'normal'){
            const registrations = await Registration.find({eventId: eventId});
            const totalRegistrations = registrations.length;
            let totalRevenue = totalRegistrations * event.registrationFee;
            let unitsSold = totalRegistrations;
            
            res.status(200).json({
                totalRegistrations,
                totalRevenue,
                unitsSold,
                eventType: event.eventType
            });
        }
        else if(event.eventType === 'merchandise'){
            const registrations = await Registration.find({eventId: eventId});
            const totalRegistrations = registrations.length;
            let totalRevenue = 0;
            let unitsSold = 0;
            
            for(let reg of registrations) {
                if(reg.merchandiseSelection && reg.merchandiseSelection.length > 0) {
                    unitsSold += reg.merchandiseSelection.length;
                    totalRevenue += reg.merchandiseSelection.length * event.merchandiseConfig.price;
                }
            }
            
            const totalStock = event.merchandiseConfig.stock || 0;
            const unitsNotSold = totalStock - unitsSold;
            
            res.status(200).json({
                totalRegistrations,
                totalRevenue,
                unitsSold,
                unitsNotSold,
                totalStock,
                eventType: event.eventType
            });
        }
        else{
            res.status(400).json({message: "Invalid event type"});
        }
        
    } catch(error) {
        res.status(500).json({message: "Server error"});
    }
});

router.put('/approveMerchandiseOrder', authMiddleware, async (req, res) => {
    if(req.user.role !== 'organizer') {
        return res.status(403).json({message: "Only organizers can approve orders"});
    }
    
    const { registrationId } = req.body;
    
    try {
        const registration = await Registration.findById(registrationId).populate('eventId').populate('participantId');
        if(!registration) {
            return res.status(404).json({message: "Registration not found"});
        }
        
        const event = registration.eventId;
        if(event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({message: "Access denied"});
        }
        
        if(registration.status !== 'Pending') {
            return res.status(400).json({message: "eRROR"});
        }
        
        registration.status = 'Approved';
        await registration.save();
        
        const user = registration.participantId;
        sendConfirmationEmail(user.email, registration.ticketID.toString(), event.eventName);
        
        return res.status(200).json({message: "Order approved successfully"});
    } catch(error) {
        return res.status(500).json({message: "Server error", error: error.message});
    }
});

router.put('/rejectMerchandiseOrder', authMiddleware, async (req, res) => {
    if(req.user.role !== 'organizer') {
        return res.status(403).json({message: "Only organizers can reject orders"});
    }
    
    const { registrationId, reason } = req.body;
    
    try {
        const registration = await Registration.findById(registrationId).populate('eventId').populate('participantId');
        if(!registration) {
            return res.status(404).json({message: "Registration not found"});
        }
        
        const event = registration.eventId;
        if(event.organizerId.toString() !== req.user.id) {
            return res.status(403).json({message: "Access denied"});
        }
        
        if(registration.status !== 'Pending') {
            return res.status(400).json({message: "Order is not in pending status"});
        }
        
        registration.status = 'Rejected';
        await registration.save();
        
        if(registration.merchandiseSelection && registration.merchandiseSelection.length > 0) {
            event.merchandiseConfig.itemsRemaining += registration.merchandiseSelection.length;
            event.registeredCount -= 1;
            await event.save();
        }
        
        // Send rejection email
        const user = registration.participantId;
        sendRejectionEmail(user.email, event.eventName, reason);
        
        return res.status(200).json({message: "Order rejected successfully"});
    } catch(error) {
        return res.status(500).json({message: "Server error", error: error.message});
    }
});

router.post('/markattendance', authMiddleware, async (req, res) => {
    if(req.user.role !== 'organizer') {
        return res.status(403).json({message: "Only organizers can mark attendance"});
    }
    
    const { ticketID, eventId } = req.body;
    if(!eventId) {
        return res.status(400).json({message: "Event ID is required"});
    }
    
    const registration = await Registration.findOne({ ticketID : ticketID })
    if(!registration) {
        return res.status(404).json({message: "Registration not found"});
    }
    
    if(registration.eventId.toString() !== eventId) {
        return res.status(400).json({message: "This ticket is not for this event"});
    }
    
    const event = await Event.findById(eventId);
    if(!event || event.organizerId.toString() !== req.user.id) {
        return res.status(403).json({message: "Access denied"});
    }
    
    if(registration.hasattended){
        return res.status(400).json({message: "Attendance already marked for this registration"});
    }
    
    registration.hasattended = true;
    registration.attendanceTimestamps = new Date();
    await registration.save();
    
    return res.status(200).json({message: "Attendance marked successfully"});
})
module.exports = router;