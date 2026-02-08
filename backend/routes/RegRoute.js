
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

dotenv.config();


const sendConfirmationEmail = async (userEmail, ticket_id) => {
    try{
         const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_ID, 
            pass: process.env.GMAIL_PASSWORD   
        }
        });
        const qrgen = await QRCode.toDataURL(ticket_id)
        const mailOptions = {
                from: `"Event Management Team" <${process.env.GMAIL_ID}>`,
                to: userEmail,
                subject: 'Your Event Ticket',
                html: `
                    <h2>Registration Confirmed!</h2>
                    <p>Your Ticket ID is: <strong>${ticket_id}</strong></p>
                    <p>Scan this QR code at the entrance:</p>
                    <br/>
                    <img src="cid:ticket-qr-code" alt="QR Code" width="200" />
                `,
                attachments: [
                    {
                        filename: 'ticket.png',
                        path: qrgen, 
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
router.put('/eventRegistration',authMiddleware,async (req,res)=>{

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
        const { eventId, formData, selectedVariants } = req.body;
        try{
            const  event = await Event.findById(eventId);
            if(!event){
                return res.status(404).json({message:"Event not found"});
            }
            if(event.status==='draft'){
                return res.status(400).json({message:"Event is not published yet"});
            }
            if(event.registeredCount >= event.registrationLimit){
                return res.status(400).json({message:"Registration limit reached"});
            }
            
            // Additional checks for merchandise events
            if(event.eventType === 'merchandise' && selectedVariants) {
                const purchaseLimit = event.merchandiseConfig?.purchaseLimit || 1;
                const stock = event.merchandiseConfig?.stock || 0;
                
                if(selectedVariants.length > purchaseLimit) {
                    return res.status(400).json({message:`Cannot select more than ${purchaseLimit} items`});
                }
                
                if(selectedVariants.length > stock) {
                    return res.status(400).json({message:`Only ${stock} items available in stock`});
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
            participantId: req.user.id,
            formData
        };
        
        // Add merchandise selection if it's a merchandise event
        if(selectedVariants && selectedVariants.length > 0) {
            registrationData.merchandiseSelection = selectedVariants;
        }

        const registration = new Registration(registrationData);
        await registration.save();
        const user = await User.findById(req.user.id);
        const  useremail = user.email;
        sendConfirmationEmail(useremail, registration.ticketID.toString());
        return res.status(200).json({message:" successful"});
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
            const registrations = await Registration.find({participantId: userid}).populate('eventId');
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
            const registrations = await Registration.find({participantId: userid}).populate('eventId');
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
        const registration = await Registration.findOne({eventId:eventid,participantId:userid})
        if(!registration){
            return res.status(404).json({message:"Registration not found"});
        }
        const qrcode = await QRCode.toDataURL(registration.ticketID);
        return res.status(200).json({ticketID: registration.ticketID,qrcode:qrcode});




    }
    catch(error){
        return res.status(500).json({message:"server error",error: error.message});
    }
})
module.exports = router;