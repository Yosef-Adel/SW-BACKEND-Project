const dotenv=require("dotenv");
const mongoose= require('mongoose');
const app = require('./app');
const cron = require('node-cron');

const db=process.env.NGO_URL_HOSTED;
let port = process.env.PORT || 3000;

mongoose.set('strictQuery', true);
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result)=> console.log(`MongoDB connected successfully`))
.catch((err)=>console.log('DB connection error',err));

const task = cron.schedule('* * * * * *', async () =>{
    const currDate = new Date();
    const events = await Event.find({isScheduled: true});
    events.forEach(async (event) => {
        if (event.publishDate < currDate) {
            console.log('publishing event', event._id);
            event.isScheduled = false;
            event.isPublished = true;
            await event.save();
        }
    });
})
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (error) => {
    console.log('Server error', error);
}); 



