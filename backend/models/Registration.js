const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');


const RegistrationSchema = new Schema({
    //made a ref object esseitally brcause populat i need
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    formData: { type: mongoose.Schema.Types.Mixed },
    fileUploads: { type: Map, of: Buffer },
    fileMimeTypes: { type: Map, of: String },
    //basicll using an universal identifier for ticket
    ticketID: { type: String, required: true, default: uuidv4 },
    attendance: {
        hasattended: { type: Boolean, default: false },
        timestamps: { type: Date, default: null }

    },
    //for merch
    merchandiseSelection: { type: mongoose.Schema.Types.Mixed },
    //for payment approval workflow
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
    paymentProof: { type: Buffer },

    hasattended: { type: Boolean, default: false },
    attendanceTimestamps: { type: Date, default: null },
    auditLog: { type: [String], default: [] }

}, {
    timestamps: true
});

module.exports = mongoose.model('Registration', RegistrationSchema);