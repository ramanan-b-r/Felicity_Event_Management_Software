const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs'); 
const validator = require('validator');



const UserSchema = new Schema({
    role: { type: String, enum: ['admin', 'participant', 'organizer'], required: true },
    firstName: { type: String, required: function() { return this.role === 'participant'; } },
    lastName: { type: String, required: function() { return this.role === 'participant'; } },
    participanttype: { type: String, enum: ['IIIT', 'Non-IIIT'], required: function() { return this.role === 'participant'; } },
    collegename: { type: String, required: function() { return this.role === 'participant'; } },
    contactnumber: { type: String, required: function() { return this.role === 'participant'; } },
    interests: { type: [String], default: [] },
    followedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    organizername: { type: String, required: function() { return this.role === 'organizer'; } },
    category: { type: [String], required: function() { return this.role === 'organizer'; } },
    contactemail: { type: String, required: function() { return this.role === 'organizer'; } },
    description: { type: String, required: function() { return this.role === 'organizer'; } },
    status: { type: String, enum: ['active', 'archived'], default: 'active',required: function() { return this.role === 'organizer'; } },
    
});
//middleware to hash password before savin
UserSchema.statics.register = async function(userData) {
    let userexists=await this.findOne({email: userData.email});
    if(!validator.isEmail(userData.email)){
        throw new Error('Invalid email format');
    };
    if(userexists){
        throw new Error('User already exists');
    }
    if (userData.participanttype === 'IIIT' && 
        !userData.email.endsWith('@students.iiit.ac.in') && 
        !userData.email.endsWith('@research.iiit.ac.in')) {
        throw new Error('Only college email allowed');
    }

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
    
    const user = new this(userData);
    return await user.save();
};

//create a mew method tied to the UserSchema to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);