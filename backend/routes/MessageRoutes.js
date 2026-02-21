const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Registration = require('../models/Registration');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const sendDiscordNotification = require('../utils/discordWebhook');
const Message = require('../models/Message');


router.get('/getMessages/:eventId', authMiddleware, async (req, res) => {
    const eventId = req.params.eventId;
    try {
        const messages = await Message.find({ eventId }).populate('userId', 'firstName lastName organizername');
        return res.status(200).json({ messages });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.post('/createMessage', authMiddleware, async (req, res) => {
    const { eventId, messageContent, parentMessageId } = req.body;
    try {
        const message = new Message({
            eventId,
            messageContent,
            parentMessageId,
            userId: req.user.id,
        });
        await message.save();
        return res.status(200).json({ message });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.post('/pinMessage', authMiddleware, async (req, res) => {
    if (req.user.role !== "organizer") {
        return res.status(403).json({ message: "Unauthorized" });
    }
    const { messageId } = req.body;
    try {
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });
        message.pinned = !message.pinned;
        await message.save();
        return res.status(200).json({ message });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.post('/deleteMessage', authMiddleware, async (req, res) => {
    if (req.user.role !== "organizer") {
        return res.status(403).json({ message: "Unauthorized" });
    }
    const { messageId } = req.body;
    try {
        await Message.deleteMany({ parentMessageId: messageId });
        await Message.findByIdAndDelete(messageId);
        return res.status(200).json({ message: "Deleted" });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.post('/likeMessage', authMiddleware, async (req, res) => {
    const { messageId } = req.body;
    try {
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });
        message.likes++;
        await message.save();
        return res.status(200).json({ message });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.post('/dislikeMessage', authMiddleware, async (req, res) => {
    const { messageId } = req.body;
    try {
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });
        message.dislikes++;
        await message.save();
        return res.status(200).json({ message });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});


module.exports = router;