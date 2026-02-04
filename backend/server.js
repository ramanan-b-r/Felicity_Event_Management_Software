const express = require("express")
//this reuiqred the dotenv package
require("dotenv").config()
const app = express()
const mongoose = require("mongoose")
const userRoutes = require('./routes/UserRoutes.js');
const eventRoutes = require('./routes/EventRoutes.js');
const regRoutes = require('./routes/RegRoute.js');
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err)
})
app.get("/", (req, res) => {
    res.status(200).json({ message: "API is working" })
})


app.use(express.json())
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registration', regRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})
 