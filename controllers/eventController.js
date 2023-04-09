const Event = require('../models/Events');
const Category = require('../models/Category');
const Venue = require('../models/Venue');
const axios = require('axios');
const mongoose = require('mongoose');



// @route   Create api/events/
// @desc    Create event
// @access  Public
exports.create = async (req, res) => {

    // Check if category exists
    const category = req.body.category;
    const categoryObject = await Category.exists({ id: category });
    if (!categoryObject) {
        return res.status(400).json({ message: "Category does not exist" });
    }

    // TODO: Check if venue exists
    // const venue = req.body.venue;
    // const venueObject = await Venue.exists({ name: req.body.name });
    // if (!venueObject) {
    //     return res.status(400).json({ message: "Venue does not exist" });
    // }

    const missingFieldErrorMessage = "field is required";
    const field = ["name", "description", "date", "location", "image", "category", "capacity", "summary", "hostedBy"];
    for (let i = 0; i < field.length; i++) {
        if (!req.body[field[i]]) {
            return res.status(400).json({ message: field[i] + " " + missingFieldErrorMessage });
        }
    }

    // Create event
    const newEvent = new Event({
        name: req.body.name,
        description: req.body.description,
        date: req.body.date,
        venue: req.body.location,
        image: req.body.image,
        category: req.body.category,
        capacity: req.body.capacity,
        summary: req.body.summary,
        hostedBy: req.body.hostedBy,
    });
    const message = "Event created successfully";

    newEvent.save()
        .then(event => res.json({ event, message }))
        .catch(err => res.status(400).json(err));
    
}

// @route   GET api/events?category=category_id&
// @desc    Get all events
// @access  Public
exports.getAll = (req, res) => {
    Event.find().populate('category')
        .then(events => res.json(events))
        .catch(err => res.status(400).json(err));
}

// @route   GET api/events/:id
// @desc    Get event by id
// @access  Public
exports.getById = (req, res) => {
    Event.findById(req.params.id).populate('category')
        .then(event => res.json(event))
        .catch(err => res.status(400).json(err));
}

// @route   PUT api/events/:id
// @desc    Update event by id
// @access  Public
exports.update =async (req, res) => {
    const event = await Event.findById(req.params.id);
    for (const key in req.body) {
        event[key] = req.body[key];
    }
    await event.save()
        .then(event => res.json(event))
        .catch(err => res.status(400).json(err));
}

// @route   DELETE api/events/:id
// @desc    Delete event by id
// @access  Public
exports.delete = (req, res) => {
    Event.findByIdAndDelete(req.params.id)
        .then(event => res.json(event))
        .catch(err => res.status(400).json(err));
}

// @route   GET api/events/search?q=keyword
// @desc    Search events by name
// @access  Public
exports.search = (req, res) => {
    const query = req.query.q;
    if (query === undefined || query === "") {
        return res.status(400).json({ message: "Query is undefined" });
    }
    const events = Event.aggregate([
        {
            "$search": {
                "index": "eventsName",
                "autocomplete": {
                    "query": query,
                    "path": "name",
                }
            }
        }
    ]).then(events => res.json(events)).catch(err => res.status(400).json(err));


}

// @route   GET api/events/nearest?lat=latitude&lng=longitude
// @desc    Get nearest events
// @access  Public
exports.getNearest = async (req, res) => {
    const lat = req.query.lat;
    const lng = req.query.lng;
    let city = "";

    const mapboxtoken = process.env.MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxtoken}`;

    const data = await axios.get(url);
    const json = data.data;
    for (const feature of json.features) {
        if (feature.place_type[0] === "region") {
            city = feature.text;
            break;
        }
    }
    
    const events = []
    res.json({ city, events});
}

// @route   GET api/events/:id/attendees
// @desc    Get attendees of an event
// @access  Public
exports.getAttendees = (req, res) => {
    Event.findById(req.params.id).populate('attendees')
        .then(event => res.json(event.attendees))
        .catch(err => res.status(400).json(err));
}

// @route   POST api/events/:id/attendees
// @desc    Add attendee to an event
// @access  Public
exports.addAttendee = async (req, res) => {
    const event = req.params.id;
    const ticketsBought = req.body.tickets;
    

}

