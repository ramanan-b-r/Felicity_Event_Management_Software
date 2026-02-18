const axios = require('axios');

const sendDiscordNotification = async (webhookUrl, eventData) => {
    try {
        await axios.post(webhookUrl, {
            content: "**New Event Created!**",
            embeds: [
                {
                    title: eventData.eventName,
                    description: eventData.eventDescription,
                    color: 5814783,
                    fields: [
                        { name: "Date", value: new Date(eventData.eventStartDate).toDateString() },

                    ]
                }
            ]
        });
    } catch (err) {
        console.error("Discord webhook error:", err.message);
    }
};

module.exports = sendDiscordNotification;
