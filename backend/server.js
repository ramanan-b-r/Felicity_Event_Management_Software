const express = require("express")
require("dotenv").config()
const cors = require('cors')
const mongoose = require("mongoose")
const http = require("http")
const { Server } = require("socket.io")
const userRoutes = require('./routes/UserRoutes.js');
const eventRoutes = require('./routes/EventRoutes.js');
const regRoutes = require('./routes/RegRoute.js');
const messageRoutes = require('./routes/MessageRoutes.js');
const app = express()
const server = http.createServer(app)

const allowedOrigins = [
    'https://felicity-event-management-software.vercel.app',
    'https://felicity-event-management-software-no9oa37e9.vercel.app',
    'http://localhost:5173'
]

// CORS must be first — before any routes
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
})

io.on('connection', (socket) => {
    socket.on('join_event', (eventId) => {
        socket.join(eventId)
    })

    socket.on('new_message', (data) => {
        socket.to(data.eventId).emit('new_message', data)
    })

    socket.on('message_pinned', (data) => {
        socket.to(data.eventId).emit('message_pinned', data)
    })

    socket.on('message_deleted', (data) => {
        socket.to(data.eventId).emit('message_deleted', data)
    })

    socket.on('message_reacted', (data) => {
        socket.to(data.eventId).emit('message_reacted', data)
    })
})

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
app.use('/api/messages', messageRoutes);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})
