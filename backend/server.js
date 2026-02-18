const express = require("express")
require("dotenv").config()
const cors = require('cors')
const mongoose = require("mongoose")
const userRoutes = require('./routes/UserRoutes.js');
const eventRoutes = require('./routes/EventRoutes.js');
const regRoutes = require('./routes/RegRoute.js');

const app = express()

// CORS must be first — before any routes
app.use(cors({
    origin: 'https://felicity-event-management-software-no9oa37e9.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

app.use(express.json())

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err)
})

app.get("/", (req, res) => {
    res.status(200).json({ message: "API is working" })
})

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registration', regRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})
