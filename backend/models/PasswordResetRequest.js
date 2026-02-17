const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { v4: uuidv4 } = require('uuid');


const OrganizerPasswordResetSchema = new Schema({
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizerEmail: { type: String, required: true },
    organizerName: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('PasswordResetRequest', OrganizerPasswordResetSchema, 'OrganizerPasswordReset');