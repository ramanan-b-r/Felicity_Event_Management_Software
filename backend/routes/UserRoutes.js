const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt  = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const createToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '5h',
    });
}

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
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
    const {role,firstName,lastName,email,password,contactnumber,participanttype,collegename,interests}=req.body;
    try{
        user=await User.register({
            role:"participant",firstName,lastName,email,password,contactnumber,participanttype,collegename,interests

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
    const user = await User.findById(userId);
    if(user.role==='organizer'){
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
    if(user.role==='participant'){ 
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

        }
    )     
    }
    if(user.role==='admin'){
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


module.exports = router;

