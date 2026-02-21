const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    messageContent: { type: String, required: true },
    parentMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    pinned: { type: Boolean, default: false },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },



}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);