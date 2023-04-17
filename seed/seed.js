const mongoose = require('mongoose');
//require the populateTickets function in the controller in populateDb.js
const {populateTickets} = require('../controllers/populateDb');
// Connect to the database
mongoose.connect('mongodb+srv://Eventbrite-backend:envie_backend_2023@eventbrite-cluster.krn9ebx.mongodb.net/Eventbrite?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// When successfully connected
mongoose.connection.on('connected', async () => {
    console.log('Connected to DB');

    // populate tickets
    await populateTickets();

    // Close the Mongoose connection
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected');
    });
});