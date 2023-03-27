//require the venue model
const Venue = require('../models/Venue');
//require the event model
const Event = require('../models/Events');

//@property: POST
//@desc: create a venue
//@access: public
const createVenue = async (req, res, next) => {
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //check if the user is a creator or not since only creators can create tickets
    if (!req.isCreator) {
        return res.status(400).json({ message: "User is not a creator." });
    }
    //check on all fields 
    if (!(req.body.name && req.body.city && req.body.address1 && req.body.country && req.body.postalCode)) {
        return res.status(400).json({ message: "All fields are required." });
    }
    let event = await Event.findById(req.params.event_id);
    if (!event) {
        return res.status(400).json({ message: "Event not found." });
    }
    let eventCapacity=event.capacity;



    try {
        const venue = new Venue({
            event: req.params.event_id,
            name: req.body.name,
            capacity: eventCapacity,
            city: req.body.city,
            address1: req.body.address1,
            address2: req.body.address2,
            state: req.body.state,
            country: req.body.country,
            postalCode: req.body.postalCode,
            longitude: req.body.longitude,
            latitude: req.body.latitude
        });
        await venue.save();
        res.status(201).json({ message: "Venue created successfully!" });
    }
    
    catch (err) {
        return res.status(400).json({ message: err.message });
    }

}

module.exports = {createVenue};