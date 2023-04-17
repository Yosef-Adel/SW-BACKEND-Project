const mongoose = require('mongoose');
const populateTickets = require('./populateTickets');
// Connect to the database
mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// When successfully connected
mongoose.connection.on('connected', async () => {
    console.log('Mongoose default connection open to mongodb://localhost:27017/myapp');

    // populate tickets
    await populateTickets();

    // Close the Mongoose connection
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected');
    });
});