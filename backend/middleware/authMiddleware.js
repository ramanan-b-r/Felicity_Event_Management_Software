const jwt = require('jsonwebtoken');
const User = require('../models/User.js');


const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({message:"There is no header attached with the response"})

    }
    if(!header.startsWith('Bearer ')){
        return res.status(401).json({message:"No bearer token"})
    }
    const token = header.split(' ')[1];
    try{
        const payload = jwt.verify(token,process.env.JWT_SECRET)
        const user = User.findById(payload.id)
        if(!user){
            return res.status(401).json({message:"User not found"})
        }
        req.user={id:payload.id,email:payload.email,role:payload.role};
        next();
    }
    catch(error){
        return res.status(401).json({message:"Invalid Token"})
    }


};

module.exports = authMiddleware;