const Event = require('../models/Events');
const Category = require('../models/Category');
const Venue = require('../models/Venue');
const User = require('../models/User');
const axios = require('axios');
const mongoose = require('mongoose');
const Date = require('date.js');



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
    const field = ["name", "description", "date", "location", "category", "capacity", "summary", "hostedBy", "createdBy"];
    for (let i = 0; i < field.length; i++) {
        if (!req.body[field[i]]) {
            return res.status(400).json({ message: field[i] + " " + missingFieldErrorMessage });
        }
    }

    // consider this, easier
    // const newEvent = await Event.create({...req.body});
    // Create event
    const newEvent = new Event({
        name: req.body.name,
        description: req.body.description,
        date: req.body.date,
        venue: req.body.location,
        // image: req.body.image,
        category: req.body.category,
        capacity: req.body.capacity,
        summary: req.body.summary,
        hostedBy: req.body.hostedBy,
        createdBy: req.body.createdBy,
        isPrivate: req.body.isPrivate,
        password: req.body.password,
        publishDate: req.body.publishDate
    });

    const message = "Event created successfully";
    if (req.file){
        newEvent.image = req.file.path;
    }
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
    // this includes new updates only and removes older info, take care
    // consider this
    // const updates = Object.keys(req.body);
    // updates.forEach((element) => (event[element] = req.body[element]));

    for (const key in req.body) {
        event[key] = req.body[key];
    }
    
    if (req.file){
        event.image = req.file.path;
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


exports.getUserEvents = async(req,res) => {
    try{
        const user = await User.findById(req.params.userId);
        if (!user){
            return res.status(400).json({message: "User not found"})
        }
        const events = await Event.find({"createdBy": user});
        if (events.length == 0){
            return res.status(400).json({message: "No events created by this user"});
        }

        return res.status(200).json(events);
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in getting user events"})
    }
}

exports.getUserPastEvents = async(req, res) => {
    try{
        console.log("hi");
        const user = await User.findById(req.params.userId);
        if (!user){
            return res.status(400).json({message: "User not found"})
        }
        const events = await Event.find({"createdBy": user});
        if (events.length == 0){
            return res.status(400).json({message: "No events created by this user"});
        }
        var eventsResult =[];
        const currDate = new Date();
        for (let event of events){
            if (event.date < currDate)
            {
                console.log(event);
                eventsResult.push(event);
            }
        }
        //events.forEach((event) => event if event.date < Date.now);;
        return res.status(200).json(eventsResult);
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in filtering user events"})
    }
}


exports.getUserUpcomingEvents = async(req, res) => {
    try{
        console.log("hi");
        const user = await User.findById(req.params.userId);
        if (!user){
            return res.status(400).json({message: "User not found"})
        }
        const events = await Event.find({"createdBy": user});
        if (events.length == 0){
            return res.status(400).json({message: "No events created by this user"});
        }
        var eventsResult =[];
        const currDate = new Date();
        for (let event of events){
            if (event.date > currDate)
            {
                console.log(event);
                eventsResult.push(event);
            }
        }
        //events.forEach((event) => event if event.date < Date.now);;
        return res.status(200).json(eventsResult);
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in filtering user events"})
    }
}
