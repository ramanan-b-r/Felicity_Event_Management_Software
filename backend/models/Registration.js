const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');


const RegistrationSchema = new Schema({
    //made a ref object esseitally brcause populat i need
    eventId :{type:mongoose.Schema.Types.ObjectId, ref:'Event', required:true},
    participantId : {type:String, required:true},
    formData : {type: mongoose.Schema.Types.Mixed},
    //basicll using an universal identifier for ticket
    ticketID : {type: String, required: true, default: uuidv4},
    attendance:{
        hasattended: {type: Boolean, default: false},
        timestamps: {type: Date , default: null}

    },
    //for merch
    merchandiseSelection: {type: mongoose.Schema.Types.Mixed}
}, {
    timestamps: true
});

module.exports = mongoose.model('Registration', RegistrationSchema);