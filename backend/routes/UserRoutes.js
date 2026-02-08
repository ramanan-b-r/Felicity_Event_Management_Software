const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const OrganizerPasswordReset = require('../models/OrganizerPasswordReset');
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');

dotenv.config();
const createToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '5h',
    });
}

const sendPasswordResetEmail = async (organizerEmail, organizerName, newPassword) => {
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
                to: organizerEmail,
                subject: 'Password Reset - Your New Password',
                html: `
                    <h2>Password Reset Approved</h2>
                    <p>Dear ${organizerName},</p>
                    <p>Your password reset request has been approved by our admin team.</p>
                    <p>Your new password is: <strong>${newPassword}</strong></p>
                    <p>Please login with this new password and change it to something memorable.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>Event Management Team</p>
                `
            };
        
        transporter.sendMail(mailOptions,(err,info)=>{
            if(err){
                console.error("Error sending password reset email:", err);
            }
            else{
                console.log("Password reset email sent successfully:", info.response);
            }
        });

    }
    catch(err){
        console.error("Error sending password reset email:", err);
    }
}

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        if (!role) {
            return res.status(400).json({message: "Please select your role to login"});
        }
        
        const user = await User.findOne({ email, role });
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"});

        }
        if(user.role ==='organizer' && user.status=='archived'){
            return res.status(400).json({message:"Archived Account"});

        }
        
        const passMatch = await user.comparePassword(password);
        if(!passMatch){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        const token = createToken(user);
        res.status(200).json({ message: 'Login successful', user ,token:token});
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

//register route
//ONLY for particpants NOT for organizers or admins
router.post('/register',async (req,res)=>{
    const {role,firstName,lastName,email,password,contactnumber,contactNumber,collegename,collegeName,interests}=req.body;
    try{
        user=await User.register({
            role:"participant",
            firstName,
            lastName,
            email,
            password,
            contactnumber: contactnumber || contactNumber,
            collegename: collegename || collegeName,
            interests

        });
        const token = createToken(user)
        res.status(201).json({message:"User registered successfully",user,token:token});
    }catch(err){
        console.error('Registration error:', err); 
        res.status(500).json({message:"Server error", error: err.message}); 
    }   
})

router.get('/getProfile',authMiddleware,async (req,res)=>{

    const userId = req.user.id;
    
    if(req.user.role==='organizer'){
        const user = await User.findById(userId);
        return res.status(200).json(
            {
                role: user.role ,    
                //iirc the organizer also has email not juust contactemail           
                email: user.email,
                organizername: user.organizername,
                category: user.category,
                contactemail: user.contactemail,
                description: user.description,
            }
        )
    }
    if(req.user.role==='participant'){ 
        const user = await User.findById(userId).populate('followedClubs', 'organizername _id');
        return res.status(200).json(
        {
            firstName: user.firstName,
            lastName:user.lastName,
            email: user.email,
            role: user.role,
            interests: user.interests,
            participanttype: user.participanttype,
            collegename: user.collegename,
            contactnumber: user.contactnumber,
            followedClubs: user.followedClubs || []
        }
    )     
    }
    if(req.user.role==='admin'){
        const user = await User.findById(userId);
        return res.status(200).json(
            {
                role: user.role ,               
                email: user.email,
            }
        )
    }

    
})  

//need to hhadle followed cluobs here lmao
router.put('/updateProfile',authMiddleware,async (req,res)=>{
    const userId = req.user.id;
    const updates = req.body;
    const role = req.user.role;
    try{
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(role==='participant'){
            user.firstName=updates.firstName || user.firstName;
            user.lastName=updates.lastName || user.lastName;
            user.contactnumber=updates.contactnumber || user.contactnumber;
            user.collegename=updates.collegename || user.collegename;
            user.interests=updates.interests || user.interests;

            await user.save();
            return  res.status(200).json({message:"Profile updated successfully",user});
        }
        else if(role==='organizer'){
            user.organizername=updates.organizername || user.organizername;
            user.category=updates.category || user.category;
            user.contactemail=updates.contactemail || user.contactemail;
            user.description=updates.description || user.description;   
            await user.save();
            return res.status(200).json({message:"Profile updated successfully",user});
        }

    }
    catch(err){
        return res.status(500).json({message:"Server error"});
    }
}
);
router.post("/createOrganizer",authMiddleware,async (req,res)=>{  

    const {organizername,category,contactemail,description,email,password}=req.body;
    if(req.user.role !=='admin'){
        return res.status(403).json({message:"Only admins can create organizers"});
    }
    try{
        // Check if organizer with this email already exists
        const existingOrganizer = await User.findOne({email: email, role: 'organizer'});
        if(existingOrganizer){
            return res.status(400).json({message:"Organizer with this email already exists"});
        }
        
        user=await User.register({
            role:"organizer",organizername,category,contactemail,description,email,password

        });
        const token = createToken(user)
        res.status(201).json({message:"Organizer account created successfully",user,token:token});
    }catch(err){
        console.error('Registration error:', err); 
        res.status(500).json({message:"Server error", error: err.message}); 
    }
 });
router.get("/getOrganizers",authMiddleware,async (req,res)=>{
    if(req.user.role !=='admin'){
        return res.status(403).json({message:"Only admins can view organizers"});
    }
    try{
        const organizers = await User.find({role:"organizer"});
        res.status(200).json({organizers});
    }catch(err){
        res.status(500).json({message:"Server error"});
    }
});

router.put("/updateOrganizerStatus",authMiddleware,async (req,res)=>{


    if(req.user.role !=='admin'){
        return res.status(403).json({message:"Only admins can archive organizers"});
    }
    else{
        const id = req.body.id;
        try{
            const organizer = await User.findById(id);
            organizer.status = req.body.status;
            await organizer.save();
            res.status(200).json({message:"Organizer archived successfully"});
        }
        catch(err){
            res.status(500).json({message:"Server error"});
        }   
    }
});

router.put("/deleteOrganizer",authMiddleware,async (req,res)=>{


    if(req.user.role !=='admin'){
        return res.status(403).json({message:"Only admins can delete organizers"});
    }
    else{
        const id = req.body.id;
        try{
                await User.findByIdAndDelete(id);
                res.status(200).json({message:"Organizer deleted successfully"});            
        }
        catch(err){
            res.status(500).json({message:"Server error"});
        }   
    }
});
// Get all active organizers for participants to view
router.get("/getAllOrganizers", authMiddleware, async (req, res) => {
    if(req.user.role !== 'participant') {
        return res.status(403).json({message: "Only participants can view organizers"});
    }
    try {
        const organizers = await User.find({
            role: "organizer",
            status: "active"
        }).select('organizername category description contactemail _id');
        
        res.status(200).json({organizers});
    } catch(err) {
        res.status(500).json({message: "Server error"});
    }
});

// Follow an organizer
router.post("/followOrganizer", authMiddleware, async (req, res) => {
    if(req.user.role !== 'participant') {
        return res.status(403).json({message: "Only participants can follow organizers"});
    }
    const { organizerId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const organizer = await User.findById(organizerId);
        
        if(!organizer || organizer.role !== 'organizer') {
            return res.status(404).json({message: "Organizer not found"});
        }
        
        if(organizer.status === 'archived') {
            return res.status(400).json({message: "Cannot follow archived organizer"});
        }
        
        if(user.followedClubs.includes(organizerId)) {
            return res.status(400).json({message: "Already following this organizer"});
        }
        
        user.followedClubs.push(organizerId);
        await user.save();
        
        res.status(200).json({message: "Successfully followed organizer"});
    } catch(err) {
        res.status(500).json({message: "Server error"});
    }
});

// Unfollow an organizer
router.post("/unfollowOrganizer", authMiddleware, async (req, res) => {
    if(req.user.role !== 'participant') {
        return res.status(403).json({message: "Only participants can unfollow organizers"});
    }
    const { organizerId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        
        if(!user.followedClubs.includes(organizerId)) {
            return res.status(400).json({message: "Not following this organizer"});
        }
        
        user.followedClubs = user.followedClubs.filter(id => id.toString() !== organizerId);
        await user.save();
        
        res.status(200).json({message: "Successfully unfollowed organizer"});
    } catch(err) {
        res.status(500).json({message: "Server error"});
    }
});

// Get organizer details for participants
router.get("/getOrganizerDetails/:organizerId", authMiddleware, async (req, res) => {
    if(req.user.role !== 'participant') {
        return res.status(403).json({message: "Only participants can view organizer details"});
    }
    const { organizerId } = req.params;
    try {
        const organizer = await User.findById(organizerId).select('organizername category description contactemail role _id');
        if(!organizer || organizer.role !== 'organizer') {
            return res.status(404).json({message: "Organizer not found"});
        }
        res.status(200).json({organizer});
    } catch(err) {
        res.status(500).json({message: "Server error"});
    }
});

// Organizer password reset request
router.post('/organizerPasswordResetRequest', async (req, res) => {
    const { email, reason } = req.body;
    try {
        const organizer = await User.findOne({ email: email, role: 'organizer' });
        if(!organizer) {
            return res.status(404).json({message: "Organizer not found"});
        }
        
        // Check if there's already a pending request
        const existingRequest = await OrganizerPasswordReset.findOne({
            organizerId: organizer._id,
            status: 'pending'
        });
        
        if(existingRequest) {
            return res.status(400).json({message: "Password reset request already pending"});
        }
        
        const resetRequest = new OrganizerPasswordReset({
            organizerId: organizer._id,
            organizerEmail: organizer.email,
            organizerName: organizer.organizername,
            reason: reason,
            status: 'pending',
            comment: ''
        });
        
        await resetRequest.save();
        res.status(201).json({message: "Password reset request submitted successfully"});
    } catch(err) {
        res.status(500).json({message: "Server error"});
    }
});

// Get all password reset requests (admin only)
router.get('/getPasswordResetRequests', authMiddleware, async (req, res) => {
    if(req.user.role !== 'admin') {
        return res.status(403).json({message: "Only admins can view password reset requests"});
    }
    try {
        const requests = await OrganizerPasswordReset.find().sort({ createdAt: -1 });
        res.status(200).json({requests});
    } catch(err) {
        res.status(500).json({message: "Server error"});
    }
});

// Approve or reject password reset request
router.put('/handlePasswordResetRequest', authMiddleware, async (req, res) => {
    if(req.user.role !== 'admin') {
        return res.status(403).json({message: "Only admins can handle password reset requests"});
    }
    const { requestId, status, comment } = req.body;
    try {
        const resetRequest = await OrganizerPasswordReset.findById(requestId);
        if(!resetRequest) {
            return res.status(404).json({message: "Reset request not found"});
        }
        
        resetRequest.status = status;
        resetRequest.comment = comment || '';
        await resetRequest.save();
        
        if(status === 'approved') {
            // Generate random password
            const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            // Update organizer's password
            await User.findByIdAndUpdate(resetRequest.organizerId, {
                password: hashedPassword
            });
            
            // Send email with new password
            sendPasswordResetEmail(resetRequest.organizerEmail, resetRequest.organizerName, newPassword);
            
            res.status(200).json({
                message: "Password reset approved and new password sent via email"
            });
        } else {
            res.status(200).json({message: `Password reset request ${status}`});
        }
    } catch(err) {
        res.status(500).json({message: "Server error"});
    }
});

module.exports = router;

