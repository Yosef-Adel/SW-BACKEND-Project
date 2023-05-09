const Event = require('../models/Events');
const Category = require('../models/Category');
const TicketClass = require('../models/Tickets');
const Order = require('../models/Order');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Readable,pipeline } = require('stream');
// import { Parser } from 'json2csv';
const { downloadResource } = require ('../utils/CSV');
const cron = require('node-cron');
const {generateQRCodeAndSendEmail}=require('../controllers/qrCodeController');
const {sendMail} = require('../utils/emailVerification');
const User = require('../models/User');
const axios = require('axios');
const mongoose = require('mongoose');
const Date = require('date.js');

const {getTicketsSold, getOrdersCount, getTotalCapacity, getTotalMoneyEarned, getTotalTicketsInOrder, getTotalTicketCapacity, getFreeTicketsSold, getPaidTicketsSold,getSumofTicketsBoughtArray,getNetSales} = require('./aggregateFunctions');
const Ticket = require('../models/Tickets');
const Organization = require('../models/Organization');
// const { CsvWriter } = require('csv-writer/src/lib/csv-writer');
const {sendNotification} = require('../utils/notification');



// @route   Create api/events/
// @desc    Create event basic info
// @access  Public
exports.create = async (req, res) => {
    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    // Check if category exists
    const category = req.body.category;
    const categoryObject = await Category.exists({ name: category });
    if (!categoryObject) {
        return res.status(400).json({ message: "Category does not exist" });
    }

    req.body['createdBy'] = req.user

    const missingFieldErrorMessage = "field is required";
    const field = ["name", "startDate", "endDate", "category"];
    console.log(req.body);
    for (let i = 0; i < field.length; i++) {
        if (!req.body[field[i]]) {
            return res.status(400).json({ message: field[i] + " " + missingFieldErrorMessage });
        }
    }

    if (!req.body.isOnline)
    {
        const venueFields = ["venueName", "city", "address1", "country", "postalCode"];
        for (let i = 0; i < venueFields.length; i++) {
            if (!req.body[venueFields[i]]) {
                return res.status(400).json({ message: venueFields[i] + " " + missingFieldErrorMessage });
            }
        }
    }

    const newEvent = await Event.create({...req.body});

    if (req.file){
        newEvent.image = req.file.path;
    }
    
    const message = "Event created successfully";
    newEvent.save()
        .then(event => res.json({ event, message }))
        .catch(err => res.status(400).json(err));
    
}

// @route   GET api/events?category=category_id&lat=lat&lng=lng
// @desc    Get all events
// @access  Public
exports.getAll = async (req, res) => {

    const category = req.query.category;
    const lat = req.query.lat;
    const lng = req.query.lng;
    const isOnline = req.query.isOnline;
    const time = req.query.time;
    const free = req.query.free;

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

    const eventQuery = Event.find({isPrivate: false, isPublished: true}).populate('category');
    if (!eventQuery){
        return res.status(400).json({message: "Event not found"});
    }

    console.log(category);
    if (category) {
        const categoryID = await Category.findOne({"name": category})
        console.log(category);
        console.log(categoryID);
        if (!categoryID) {
            return res.status(400).json({ message: "Category does not exist" });
        }


        eventQuery.where('category').equals(categoryID._id);
    }

    if (lat && lng) {
        eventQuery.where('city').equals(city);
    }

    if (isOnline) {
        const online = true ? isOnline === "true" : false;
        eventQuery.where('isOnline').equals(online);
    }

    if (time) {
        const today = new Date();
        let tomorrow =  new Date()
        tomorrow.setDate(today.getDate() + 1)
        let afterTomorrow = new Date()
        afterTomorrow.setDate(today.getDate() + 2)
        afterTomorrow.setUTCHours(0);
        afterTomorrow.setUTCMinutes(0);
        afterTomorrow.setUTCSeconds(0);
        afterTomorrow.setUTCMilliseconds(0);

        // Remove time from date
        console.log(today);
        today.setUTCHours(0);
        today.setUTCMinutes(0);
        today.setUTCSeconds(0);
        today.setUTCMilliseconds(0);
        tomorrow.setUTCHours(1);
        tomorrow.setUTCMinutes(0);
        tomorrow.setUTCSeconds(0);
        tomorrow.setUTCMilliseconds(0);
        if (time === "today") {
            // Check events that start today
            console.log(today);
            console.log(tomorrow);

            eventQuery.where('startDate').gte(today).lte(tomorrow);
        }
        else if (time == "tomorrow"){
            eventQuery.where('startDate').gte(tomorrow).lte(afterTomorrow);
        } else if (time === "week") {
            const week = new Date(today);
            week.setDate(week.getDate() + 7);
            eventQuery.where('startDate').gte(today).lte(week);
        } else if (time === "month") {
            const month = new Date(today);
            month.setDate(month.getDate() + 30);
            eventQuery.where('startDate').gte(today).lte(month);
        }
    }

    if (free) {
        eventQuery.where('price').equals(0);
    }

    eventQuery.then(events => res.json({ city, events}))
        .catch(err => res.status(400).json(err));

}


// the same api as above but with pagination
exports.getAllPaginated = async (req, res) => {
    const category = req.query.category;
    const lat = req.query.lat;
    const lng = req.query.lng;
    const isOnline = req.query.isOnline;
    const time = req.query.time;
    const free = req.query.free;


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

    const eventQuery = Event.find({isPrivate: false, isPublished: true}).populate('category');
    if (!eventQuery)
    {
        return res.status(400).json({message: "Event not found"});
    }
    if (category) {
        const categoryID = await Category.findOne({name: category})
        console.log(category);
        console.log(categoryID);
        if (!categoryID) {
            return res.status(400).json({ message: "Category does not exist" });
        }


        eventQuery.where('category').equals(categoryID._id);
    }

    if (lat && lng) {
        eventQuery.where('city').equals(city);
    }

    if (isOnline) {
        const online = true ? isOnline === "true" : false;
        eventQuery.where('isOnline').equals(online);
    }

    if (time) {
        const today = new Date();
        let tomorrow =  new Date()
        tomorrow.setDate(today.getDate() + 1)
        let afterTomorrow = new Date()
        afterTomorrow.setDate(today.getDate() + 2)
        afterTomorrow.setUTCHours(0);
        afterTomorrow.setUTCMinutes(0);
        afterTomorrow.setUTCSeconds(0);
        afterTomorrow.setUTCMilliseconds(0);

        // Remove time from date
        console.log(today);
        today.setUTCHours(0);
        today.setUTCMinutes(0);
        today.setUTCSeconds(0);
        today.setUTCMilliseconds(0);
        tomorrow.setUTCHours(1);
        tomorrow.setUTCMinutes(0);
        tomorrow.setUTCSeconds(0);
        tomorrow.setUTCMilliseconds(0);
        if (time === "today") {
            // Check events that start today
            console.log(today);
            console.log(tomorrow);

            eventQuery.where('startDate').gte(today).lte(tomorrow);
        }
        else if (time == "tomorrow"){
            eventQuery.where('startDate').gte(tomorrow).lte(afterTomorrow);
        } else if (time === "week") {
            const week = new Date(today);
            week.setDate(week.getDate() + 7);
            eventQuery.where('startDate').gte(today).lte(week);
        } else if (time === "month") {
            const month = new Date(today);
            month.setDate(month.getDate() + 30);
            eventQuery.where('startDate').gte(today).lte(month);
        }
    }

    if (free) {
        eventQuery.where('price').equals(0);
    }

    // for pagination

    // request for a certain limit of events 
    // then see more button to request all events
    // will send the same request but with no limit
    // which will get all the events back
    var limit=0;
    
    const eventCountQuery = eventQuery.clone();
    

    try{
        // count the number of documents in the query
        // extract the events from the query first
        const actualReturnedNumber = await eventCountQuery.countDocuments();
        console.log(actualReturnedNumber);
        limit = parseInt(req.query.limit) || actualReturnedNumber;
    }
    catch(err){
        console.log(err);
        res.status(400).json(message="In calculating limit");
    }
    // console.log(limit);
    
    try {
        const events= await eventQuery.limit(limit);
        res.json({ city, events});
    }
    catch(err){
        console.log(err);
        res.status(400).json(message="Error in getting events");
    }

    // eventQuery.then(events => res.json({ city, events}))
    //     .catch(err => res.status(400).json(err));

}

// @route   GET api/events?category=category_id&
// @desc    Get all events
// @access  Public
exports.getAllEvents = (req, res) => {
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

exports.getPrivateEventByPassword = async(req, res)=>{
    try{
        const event = await Event.findById(req.params.id);
        if (!event)
        {
            return res.status(400).json({message: "Event not found"});
        }
        
        if (event.password){
            if (!req.body.password){
                return res.status(400).json({message:"You can't access this link without a password."});
            }
            if (event.password != req.body.password){
                return res.status(400).json({message: "Password is incorrect."});
            }
        }
        return res.status(200).json(event);

    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in getting private events by password"});
    }
}

// @route   PUT api/events/:id
// @desc    Update event by id
// @access  Public
exports.update = async (req, res) => {
    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    const event = await Event.findById(req.params.id);
    if (!event){
        return res.status(400).json({message : "Event not found"})
    }

    const updates = Object.keys(req.body);
    // console.log(updates)
    const allowedUpdates = ['isPublished', 'isPrivate', 'isScheduled','publishDate', 'summary', 'description', 'capacity', 'password'];
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
    if (!isValidUpdate) {
        return res.status(400).json({message: "Your request contains fields that cannot be updated. Please enter only valid fields."});
    }

    for (let update of updates){
        if (update === 'capacity'){
            if (req.body.capacity < event.capacity){
                return res.status(400).json({message: "New capacity has to be bigger than previous."})
            }
            // console.log(req.body.capacity)
            event.capacity = req.body.capacity;
        }
        if (update == 'summary'){
            event.summary = req.body.summary;
        }
        if (update == 'description'){
            event.description = req.body.description;
        }
        if (update === 'isPrivate'){
            event.isPrivate = req.body.isPrivate
        }

        if (update === 'password'){
            event.password = req.body.password
        }

        if (update === 'isPublished'){
            // console.log(event.isPublished);
            // console.log(req.body.isPublished);
            event.isPublished = req.body.isPublished
            if (req.body.isPublished.toString() == 'true') {
                event.isScheduled = false;
            }
        }

        if (update == 'isScheduled'){
            event.isScheduled = true
            event.isPublished = false
            const date = new Date(req.body.publishDate);
            event.publishDate = date;
        }
    }

    if (req.file){
        event.image = req.file.path;
    }
    

    // console.log(event.isPublished);
    // console.log(event.isScheduled);
    // not published and not scheduled

    if (req.body.isPublished.toString() == 'false' && req.body.isScheduled.toString() == 'false')
    {
        return res.status(400).json({message : "You have to either enter a scheduling date or publish event now."})
    }

    
    //published and scheduled
    if (req.body.isPublished.toString() == 'true' && req.body.isScheduled.toString() == 'true')
    {
        console.log(req.body.isPublished)
        console.log(req.body.isScheduled)
        return res.status(400).json({message: "You can't publish now and schedule at the same time."});
    }


    await event.save()
        .then(event => res.json(event))
        .catch(err => res.status(400).json(err));
}

// @route   DELETE api/events/:id
// @desc    Delete event by id
// @access  Public
exports.delete = async(req, res) => {
    try{
        // check if the user is authorized
        if (!req.isCreator){
            return res.status(400).json({message: "You are not a creator"});
        }
        const event = await Event.findById(req.params.id);
        if (!event)
        {
            return res.status(400).json({message: "Event not found"});
        }
        const ticketsArray = event.tickets;
        console.log(ticketsArray);
        for (let i=0; i< ticketsArray.length; i++){
            const ticket = await TicketClass.deleteOne(ticketsArray[i]);
            if (!ticket){
                return res.status(400).json({message: "Ticket not found"});
            }
        };

        const orders = await Order.find({event: req.params.id});
        for(let order of orders){
            await Order.deleteOne(order);
        }
        await Event.findByIdAndDelete(req.params.id);

        return res.status(200).json({message: "Event deleted successfully", event})
    }
    
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in deleting event"})
    }
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
    
    const events = await Event.find({ "venue.city": city, isPrivate: false, isPublished: true }).populate('category');
    res.json({ city, events});
}

// @route   GET api/events/:id/attendees
// @desc    Get attendees of an event
// @access  Public
exports.getAttendees = (req, res) => {
    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    Event.findById(req.params.id).populate('attendees')
        .then(event => res.json(event.attendees))
        .catch(err => res.status(400).json(err));
}

// @route   POST api/events/:id/attendees
// @desc    Add attendee to an event
// @access  Public
exports.addAttendee = async (req, res) => {
    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    const event = req.params.id;
    const ticketsBought = req.body.ticketsBought;
    
    let subTotal = 0;
    let total = 0;
    let faceValue = 0;
    let ticketDetails = [];
    
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new Error("User not found");
        }
        for (const ticket of ticketsBought) {
            const ticketClass = await TicketClass.findById(ticket.ticketClass);
            if (!ticketClass) {
                throw new Error("Ticket class not found");
            }
            if (ticketClass.capacity < ticket.number + ticketClass.sold) {
                throw new Error("Ticket class capacity exceeded");
            }
            faceValue += ticket.faceValue;
            subTotal += ticketClass.price * ticket.number;
            ticketClass.sold += ticket.number;
            await ticketClass.save();
            ticketDetails.push({
                ticketType: ticketClass.name,
                quantity: ticket.number,
                price: ticketClass.price,
                fee:0,
                totalPrice: ticket.faceValue
            });

        }
    
        const order = await Order({
            event: event,
            user: user,
            ticketsBought: ticketsBought,
            fees: 0,
            subTotal: subTotal,
            total: faceValue,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });

        let eventURL=process.env.FRONT_DEPLOY+"/user/event/"+event;

        const eventObject = await Event.findById(req.params.id);
        //sending the mail to the email specified in the order form
        await generateQRCodeAndSendEmail(eventURL,user._id,order.email,ticketDetails);
        
        //sending an email to notify the user
        const creator = await User.findById(req.params.creatorId);
        const notifyingText = `Hi ${req.body.firstName}, ${creator.firstName} ${creator.lastName} got you tickets to ${eventObject.name}! Click here to go to the event page ${eventURL}`;
        
        await sendMail({
        email: req.body.email,
        subject: `${creator.firstName} ${creator.lastName} got you tickets to ${eventObject.name}`,
        message: notifyingText
        });

        const notificationMessage = {
            title: "New Order",
            body: notifyingText
        }
        // "d2ySh3grCYccs5EpX7T882:APA91bGItx6UMtrGlKIRBxPgnFsSTGe2HpfzmlRjyXJ0qc_-KvUMI-BwywKuvenFkqHEniV4Hf-PcWB7SBaUAXQZnNrJj8iioHmCAItH8AAYKbkg77sJO-AFywJ6K8zU0NnT2vRkNs-t"
        sendNotification(notificationMessage,user.firebaseRegistrationToken);

        res.status(201).json({message: "Order created successfully!",
            order: order
        });

        await order.save();
        
    } catch (error) {
        res.status(500).json(error.message);
    }
}


exports.downloadUserEvents = async(req,res) => {
    try{
        // check if the user is authorized
    // if (!req.isCreator){
    //     return res.status(400).json({message: "You are not a creator"});
    // }
        const user = await User.findById(req.params.userId);
        if (!user){
            return res.status(400).json({message: "User not found"});
        }
        const events = await Event.find({"createdBy": user});
        if (events.length == 0){
            return res.status(400).json({message: "No events created by this user"});
        }
        const header = Object.keys(events[0].toJSON());
        return downloadResource(res, 'users.csv', header, events);
        
    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in downloading user events"});
    }
}


function getTicketsSoldAndCapacity(tickets){
    let numberOfTicketsSold = 0;
    let numberOfTicketsCapacity = 0;
    for (let ticket of tickets){
        numberOfTicketsSold += ticket.sold;
        numberOfTicketsCapacity += ticket.capacity;
    }
    return [numberOfTicketsSold,numberOfTicketsCapacity];
}


exports.getUserEvents = async(req,res) => {
    try{
        if (!req.isCreator){
            return res.status(400).json({message: "You are not a creator"})
        }
        const user = mongoose.Types.ObjectId(req.params.userId);

        const events = await Event.find({"createdBy": user});

        if (!events.length){
            return res.status(400).json({message: "No events created by this user"});
        }
        let newEvents = [];
        
        for (let event of events){
            event = event.toJSON();
            let numberOfTicketsSold = 0;
            let numberOfTicketsCapacity = 0;
            const tickets = await TicketClass.find({"event": event._id});
            for (let ticket of tickets){
                numberOfTicketsSold += ticket.sold;
                numberOfTicketsCapacity += ticket.capacity;
            }
            event.numberOfTicketsSold = numberOfTicketsSold;
            event.numberOfTicketsCapacity = numberOfTicketsCapacity;
            newEvents.push(event);
            
        }
        console.log(newEvents);



        return res.status(200).json({message: "Success", events:newEvents});

    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in filtering user events"});
    }

}

exports.getUserPastEvents = async(req, res) => {
    try{
        if (!req.isCreator)
        {
            return res.status(400).json({message: "You are not a creator"})
        }

        const user = mongoose.Types.ObjectId(req.params.userId);

        const events = await Event.find({"createdBy": user});

        const userEvents = [];
        const currDate = new Date();
        for (let event of events){
            event = event.toJSON();

            let numberOfTicketsSold = 0;
            let numberOfTicketsCapacity = 0;
            const tickets = await TicketClass.find({"event": event._id});
            for (let ticket of tickets){
                numberOfTicketsSold += ticket.sold;
                numberOfTicketsCapacity += ticket.capacity;
            }
            event.numberOfTicketsSold = numberOfTicketsSold;
            event.numberOfTicketsCapacity = numberOfTicketsCapacity;
            if (event.startDate < currDate)
            {
                userEvents.push(event);
            }
        }

        if (userEvents.length == 0){
            return res.status(400).json({message: "No past events created by this user"});
        }
        
        return res.status(200).json({message: "Success", userEvents});
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in filtering user events"});
    }
}


exports.getUserUpcomingEvents = async(req, res) => {
    try{
        if (!req.isCreator)
        {
            return res.status(400).json({message: "You are not a creator"})
        }
        // Cast the user id to Object Id mongoose
        const user = mongoose.Types.ObjectId(req.params.userId);

        const events = await Event.find({"createdBy": user});
        const userEvents = [];
        const currDate = new Date();
        for (let event of events){
            event = event.toJSON();

            let numberOfTicketsSold = 0;
            let numberOfTicketsCapacity = 0;
            const tickets = await TicketClass.find({"event": event._id});
            for (let ticket of tickets){
                numberOfTicketsSold += ticket.sold;
                numberOfTicketsCapacity += ticket.capacity;
            }
            event.numberOfTicketsSold = numberOfTicketsSold;
            event.numberOfTicketsCapacity = numberOfTicketsCapacity;
            if (event.startDate > currDate)
            {
                userEvents.push(event);
            }
        }
        
        if (userEvents.length == 0){
            return res.status(400).json({message: "No upcoming events created by this user"});
        }
        
        return res.status(200).json({message: "Success", userEvents});
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in filtering user events"})
    }
}

/////////////////////////////Dashboard Reports Functions/////////////////////////////

//Attendee Report function
//Here the the info about every ticket sold for an event 
//and the info of the attendee that bought it
//We assume that tickets of the same ticket type related to the same order have the same info 
//so the report will contain details about every ticket type of an order in the event, not the actual single ticket
exports.getAttendeeReport = async (req, res) => {
    //event id in the request params
    const eventId = req.params.eventId;
    const page = parseInt(req.query.page) || 1; // extract page from query parameters or default to 1
    const orderLimit = parseInt(req.query.orderLimit) || 5; // extract limit from query parameters or default to 10
    //check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ message: "You are not logged in" });
    }

    //check that the user is a creator
    //and this user is the creator of the event
    if (req.user.isCreator == false) {
        return res.status(401).json({ message: "You are not a creator" });
    }
    //check if the event exists
    if (!eventId) {
        return res.status(400).json({ message: "Event doesn't exist" });
    }

    const event = await Event.findById(eventId);
    if (!event)
    {
        return res.status(400).json({message: "Event not found"});
    }

    if (event.createdBy && event.createdBy != req.user._id) {
        return res.status(401).json({ message: "You are not the creator of this event" });
    }

    if(typeof event.createdBy === 'undefined'){
        return res.status(401).json({ message: "You are not the creator of this event" });
    }
    // console.log(event.createdBy);

    //get the order count
    const orderCount = await getOrdersCount(eventId);

    // set the total number of pages depending on the orders count
    const totalPages = Math.ceil(orderCount / orderLimit);

    //get the total sold tickets count
    //which is the number of attendees
    // change this to be the number of orders
    const AttendeesCount = await getOrdersCount(eventId);
    // const AttendeesCount = await getTicketsSold(eventId);

    //setup the response object
    const response = {
        totalOrders: orderCount,
        totalAttendees: AttendeesCount,
        Report: [],
        pagination: {
            totalOrders: orderCount,
            totalPages: totalPages,
            currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        }
    };

    //loop through every order with the event id
    //and get to the tickets array
    //I want to see the number of tickets for each order and the type
    
    var attendeeStatus="";

    const orders=await Order.find({event:eventId})
    .skip((page - 1) * orderLimit)
    .limit(orderLimit)

    // console.log(orders);
    for (let order of orders) {
        const canceled=order.canceled;
        const user=await User.findById(order.user);
        if(!user){
            continue;
        }
        // console.log(order);
        const tickets = order.ticketsBought;
        //check on the date of the event
        //if the event is in the future then the attendee is attending
        const currentDate = new Date();
        if(event.startDate > currentDate  && canceled==false){
            attendeeStatus="Attending";
        }
        //if the event is in the past then the attendee is attended
        else if(event.startDate < currentDate && canceled==false){
            attendeeStatus="Attended";
        }
        //if the event is in the past and the order is canceled then the attendee is not attended
        else if(canceled==true){
            attendeeStatus="Not Attending";
        }

        for (let ticket of tickets) {
            const ticketType = await Ticket.findById(ticket.ticketClass);
            const ticketNum=ticket.number;
            //push the info to the response object
            response.Report.push({
                orderNumber: order._id,
                orderDate:order.createdAt,
                attendeeStatus:attendeeStatus,
                name: user.firstName+" "+user.lastName,
                email: user.emailAddress,
                eventName: event.name,
                ticketQuantity: ticketNum,
                ticketType: ticketType.name,
                ticketPrice: ticketType.price,
                BuyerName: order.firstName+" "+order.lastName,
                BuyerEmail: order.email
            });
        }
    }

    

    //try to send the response
    try {
        res.status(200).json(response);
    }
    //catch any errors
    catch (err) {
        console.log(err.message);
        res.status(400).json({ message: "Error in getting the attendee report" });
    }

};
exports.downloadAttendeeReport = async (req, res) => {
    //event id in the request params
    const eventId = req.params.eventId;
    //check if the user is logged in
    // if (!req.user) {
    //     return res.status(401).json({ message: "You are not logged in" });
    // }
    // //check that the user is a creator
    // //and this user is the creator of the event
    // if (req.user.isCreator == false) {
    //     return res.status(401).json({ message: "You are not a creator" });
    // }
    //check if the event exists
    if (!eventId) {
        return res.status(400).json({message: "Event id is missing"});
    }

    //get the order count
    const orderCount = await getOrdersCount(eventId);

    //get the total sold tickets count
    //which is the number of attendees
    const AttendeesCount = await getTicketsSold(eventId);

    //setup the response object
    const response = {
        totalOrders: orderCount,
        totalAttendees: AttendeesCount,
        Report: [],
    };

    //loop through every order with the event id
    //and get to the tickets array
    //I want to see the number of tickets for each order and the type
    const event = await Event.findById(eventId);
    if (!event)
    {
        return res.status(400).json({message: "Event not found"});
    }

    var attendeeStatus="";

    const orders=await Order.find({event:eventId});
    for (let order of orders) {
        const canceled=order.canceled;
        const user=await User.findById(order.user);
        if(!user){
            continue;
        }
        const tickets = order.ticketsBought;
        //check on the date of the event
        //if the event is in the future then the attendee is attending
        const currentDate = new Date();
        if(event.startDate > currentDate  && canceled==false){
            attendeeStatus="Attending";
        }
        //if the event is in the past then the attendee is attended
        else if(event.startDate < currentDate && canceled==false){
            attendeeStatus="Attended";
        }
        //if the event is in the past and the order is canceled then the attendee is not attended
        else if(canceled==true){
            attendeeStatus="Not Attending";
        }

        for (let ticket of tickets) {
            const ticketType = await Ticket.findById(ticket.ticketClass);
            const ticketNum=ticket.number;
            //push the info to the response object
            response.Report.push({
                orderNumber: order._id,
                orderDate:order.createdAt,
                attendeeStatus:attendeeStatus,
                name: user.firstName+" "+user.lastName,
                email: user.emailAddress,
                eventName: event.name,
                ticketQuantity: ticketNum,
                ticketType: ticketType.name,
                ticketPrice: ticketType.price,
                BuyerName: order.firstName+" "+order.lastName,
                BuyerEmail: order.email
            });
        }
    }


    
    //try to send the response
    try {
        const header = Object.keys(response.Report[0]);

        return downloadResource(res, 'attendee.csv', header, response.Report);
    }
    //catch any errors
    catch (err) {
        console.log(err.message);
        res.status(400).json({ message: "Error in getting the attendee report" });
    }

};

//sales report function
//sales by ticket type
exports.getSalesByTicketTypeReport = async (req, res) => {
    //event id in the request params
    const eventId = req.params.eventId;
    const page = parseInt(req.query.page) || 1; // extract page from query parameters or default to 1
    const orderLimit = parseInt(req.query.orderLimit) || 5; // extract limit from query parameters or default to 5
    //check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ message: "You are not logged in" });
    }
    //check that the user is a creator
    //and this user is the creator of the event
    if (req.user.isCreator == false) {
        return res.status(401).json({ message: "You are not a creator" });
    }
    //check if the event exists
    if (!eventId) {
        return res.status(400).json({ message: "Event id is missing" });
    }

    const event=await Event.findById(eventId);
    if (!event)
    {
        return res.status(400).json({message: "Event not found"});
    }

    if (event.createdBy && event.createdBy != req.user._id) {
        return res.status(401).json({ message: "You are not the creator of this event" });
    }
    if(typeof event.createdBy === 'undefined'){
        return res.status(401).json({ message: "You are not the creator of this event" });
    }


    //get the order count
    const orderCount = await getOrdersCount(eventId);

    // // the total number of pages
    // //is the multiplication of the number of orders and the sum of lengths of ticketsBought array of every order divided by the limit
    // const ticketsBoughtLength = await getSumofTicketsBoughtArray(eventId);
    // // console.log(ticketsBoughtLength);
    // const totalPages = Math.ceil(orderCount*ticketsBoughtLength / limit);
    const totalPages = Math.ceil(orderCount / orderLimit);

    // the total attendee count is the same as the total orders count
    const AttendeesCount = await getOrdersCount(eventId);

    //total sales
    const totalSales = await getTotalMoneyEarned(eventId);

    //initialize the response object
    const response = {
        totalOrders: orderCount,
        totalAttendees: AttendeesCount,
        totalSales: totalSales,
        Report: [],
        pagination: {
            totalOrders: orderCount,
            totalPages: totalPages,
            currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        }
    };

    //get the event
    var attendeeStatus="";
    var orderType="";
    //get order
    const orders=await Order.find({event:eventId})
    .skip((page - 1) * orderLimit)
    .limit(orderLimit);

    for (let order of orders) {
        const canceled=order.canceled;
        const tickets = order.ticketsBought;
        const user=await User.findById(order.user);
        if(!user){
            continue;
        }
        //check on the date of the event
        //if the event is in the future then the attendee is attending
        const currentDate = new Date();
        if(event.startDate > currentDate  && canceled==false){
            attendeeStatus="Attending";
        }
        //if the event is in the past then the attendee is attended
        else if(event.startDate < currentDate && canceled==false){
            attendeeStatus="Attended";
        }
        //if the event is in the past and the order is canceled then the attendee is not attended
        else if(canceled==true){
            attendeeStatus="Not Attending";
        }
        if(order.total==0){
            orderType="Free Order";
        }
        else{
            orderType="Paid Order";
        }

        for (let ticket of tickets) {
            const ticketType = await Ticket.findById(ticket.ticketClass);
            const ticketNum=ticket.number;
            //push the info to the response object
            response.Report.push({
                orderNumber: order._id,
                orderDate:order.createdAt,
                firstName:order.firstName,
                lastName:order.lastName,
                email:order.email,
                quantity:ticketNum,
                ticketType:ticketType.name,
                attendeeNumber:user._id,
                orderType:orderType,
                orderCurrency:"EGP",
                totalPaid:ticketType.price*ticketNum,
                feesPaid:ticketType.fee*ticketNum,
                attendeeStatus:attendeeStatus,
            });
        }
    }

    // //slice the response to get the data of the current page
    // response.Report = response.Report.slice((page - 1) * limit, page * limit);
    
    //try to send the response
    try {
        res.status(200).json(response);
    }
    //catch any errors
    catch (err) {
        console.log(err.message);
        res.status(400).json({ message: "Error in getting the sales by ticket type report" });
    }
};


exports.getOrderSummaryReport = async (req, res) => {
    const eventId = req.params.eventId;
    const page = parseInt(req.query.page) || 1; // extract page from query parameters or default to 1
    const limit = parseInt(req.query.limit) || 5; // extract limit from query parameters or default to 5

    if (!req.user) {
        return res.status(401).json({ message: "You are not logged in" });
    }

    if (req.user.isCreator === false) {
        return res.status(401).json({ message: "You are not a creator" });
    }

    if (!eventId) {
        return res.status(400).json({ message: "Event id is missing" });
    }

    const event=await Event.findById(eventId);
    if(!event){
        return res.status(400).json({ message: "Event not found" });
    }

    if (event.createdBy && event.createdBy != req.user._id) {
        return res.status(401).json({ message: "You are not the creator of this event" });
    }
    if(typeof event.createdBy === 'undefined'){
        return res.status(401).json({ message: "You are not the creator of this event" });
    }

    const orders = await Order.find({ event: eventId })
      .skip((page - 1) * limit) // skip documents based on page number and limit
      .limit(limit); // limit the number of documents returned

    const totalOrders = await Order.countDocuments({ event: eventId });

    const totalPages = Math.ceil(totalOrders / limit); // calculate total number of pages

    const response = {
        Report: [],
        pagination: {
            totalOrders: totalOrders,
            totalPages: totalPages,
            currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
    };

    // console.log(orders);

    for (let order of orders) {
        const orderId = order._id;
        const user = await User.findById(order.user);
        console.log(user);

        if (!user) {
        continue;
        }

        const totalTickets = await getTotalTicketsInOrder(orderId, eventId);

        response.Report.push({
        orderNumber: order._id,
        name: user.firstName + " " + user.lastName,
        quantity: totalTickets,
        price: order.total,
        date: order.createdAt,
        });

        // console.log(response.Report);
    }

    try {
        res.status(200).json(response);
    } catch (err) {
        res.status(400).json({ message: "Error in getting the order summary report" });
    }
};

// get the event url
exports.getEventUrl = async (req, res) => {
    //event id in the request params
    const eventId = req.params.eventId;
    //check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ message: "You are not logged in" });
    }
    //check that the user is a creator
    //and this user is the creator of the event
    if (req.user.isCreator == false) {
        return res.status(401).json({ message: "You are not a creator" });
    }
    //check if the event exists
    if (!eventId) {
        return res.status(400).json({ message: "Event id is missing" });
    }

    const event=await Event.findById(eventId);
    if(!event){
        return res.status(400).json({ message: "Event not found" });
    }

    if (event.createdBy && event.createdBy != req.user._id) {
        return res.status(401).json({ message: "You are not the creator of this event" });
    }
    if(typeof event.createdBy === 'undefined'){
        return res.status(401).json({ message: "You are not the creator of this event" });
    }

    //return the event url
    try 
    {
        const url = process.env.FRONT_DEPLOY+"/user/event/"+eventId;
        res.status(200).json({ url: url });
    } 
    catch (err) {
        res.status(400).json({ message: "Error in getting the event url" });
    }


};

//get tickets sold for an event
exports.getTicketsSoldForEvent = async (req, res) => {
    //event id in the request params
    const eventId = req.params.eventId;
    //check if the user is logged in
    if (!req.user) {
        return res.status(401).json({ message: "You are not logged in" });
    }
    //check that the user is a creator
    //and this user is the creator of the event
    if (req.user.isCreator == false) {
        return res.status(401).json({ message: "You are not a creator" });
    }
    //check if the event exists
    if (!eventId) {
        return res.status(400).json({ message: "Event id is missing" });
    }
    const event=await Event.findById(eventId);
    if(!event){
        return res.status(400).json({ message: "Event not found" });
    }
    

    if (event.createdBy && event.createdBy != req.user._id) {
        return res.status(401).json({ message: "You are not the creator of this event" });
    }
    if(typeof event.createdBy === 'undefined'){
        return res.status(401).json({ message: "You are not the creator of this event" });
    }

    //get the total sold tickets count
    const soldTickets=await getTicketsSold(eventId);

    const eventCapacity=event.capacity;

    const totalTicketCapacity=await getTotalCapacity(eventId);

    var TotalCapacityFinal=eventCapacity;
    if (totalTicketCapacity < eventCapacity) 
    {
        TotalCapacityFinal = totalTicketCapacity;
    }

    const freeTicketsSold=await getFreeTicketsSold(eventId);
    const paidTicketsSold=await getPaidTicketsSold(eventId);

    //try to send the response
    try {
        res.status(200).json({
            soldTickets: soldTickets,
            totalCapacity: TotalCapacityFinal,
            freeTicketsSold: freeTicketsSold,
            paidTicketsSold: paidTicketsSold
        });
    }
    //catch any errors
    catch (err) {
        res.status(400).json({ message: "Error in getting the tickets sold for an event" });
    }    
};

// function for the sales by ticket type report in the dashboard
exports.getSalesByTicketTypeDashboard = async (req, res) => {
            //event id in the request params
            const eventId = req.params.eventId;
            const page = parseInt(req.query.page) || 1; // extract page from query parameters or default to 1
            const limit = parseInt(req.query.limit) || 5; // extract limit from query parameters or default to 5
            //check if the user is logged in
            if (!req.user) {
                return res.status(401).json({ message: "You are not logged in" });
            }
            //check that the user is a creator
            //and this user is the creator of the event
            if (req.user.isCreator == false) {
                return res.status(401).json({ message: "You are not a creator" });
            }
            //check if the event exists
            if (!eventId) {
                return res.status(400).json({ message: "Event doesn't exist" });
            }

            const event=await Event.findById(eventId);
            if(!event){
                return res.status(400).json({ message: "Event doesn't exist" });
            }
        
            if (event.createdBy && event.createdBy != req.user._id) {
                return res.status(401).json({ message: "You are not the creator of this event" });
            }
            if(typeof event.createdBy === 'undefined'){
                return res.status(401).json({ message: "You are not the creator of this event" });
            }

            // get total tickets of the event
            const ticketTypes= event.tickets.length;
            const totalPages=Math.ceil(ticketTypes/limit);
    //initialize the response object
    const response = {
        Report: [],
        pagination: {
            totalTickets: ticketTypes,
            totalPages: totalPages,
            currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        }
    };

        const tickets=await Ticket.find({event:eventId})
        .skip((page - 1) * limit) 
        .limit(limit)
        for(let ticket of tickets)
        {
            const ticketPriceNum=ticket.price;
            const ticketPriceStr="free";
            var ticketPriceFinal=ticketPriceNum;
            if(ticketPriceNum==0){
                ticketPriceFinal=ticketPriceStr;
            }

            response.Report.push({
                ticketType: ticket.name,
                Price: ticketPriceFinal,
                sold: ticket.sold,
                total: ticket.capacity
            });

        }

        try {
            res.status(200).json(response);
        }
        catch (err) {
            res.status(400).json({ message: "Error in getting the sales by ticket type" });
        }

};

// create a function to return the most recent 4 orders in the dashboard

exports.getOrderSummaryReportMostRecent=async(req,res)=>{
            //event id in the request params
            const eventId = req.params.eventId;
            if (!req.user) {
                return res.status(401).json({ message: "You are not logged in" });
            }
            //check that the user is a creator
            //and this user is the creator of the event
            if (req.user.isCreator == false) {
                return res.status(401).json({ message: "You are not a creator" });
            }
            //check if the event exists
            if (!eventId) {
                return res.status(400).json({ message: "Event doesn't exist" });
            }

            const event=await Event.findById(eventId);
            if(!event){
                return res.status(400).json({ message: "Event doesn't exist" });
            }
        
            if (event.createdBy && event.createdBy != req.user._id) {
                return res.status(401).json({ message: "You are not the creator of this event" });
            }
            if(typeof event.createdBy === 'undefined'){
                return res.status(401).json({ message: "You are not the creator of this event" });
            }

            // const totalOrders = await Order.countDocuments({ event: eventId });

            // these orders are sorted by the most recent
            const orders=await Order.find({event:eventId}).sort({createdAt:-1}).limit(4);

            //initialize the response object
            const response = {
                Report: []
            };
            

            for (let order of orders) {
                const orderId = order._id;
                const user = await User.findById(order.user);
                // console.log(user);
        
                if (!user) {
                continue;
                }
        
                const totalTickets = await getTotalTicketsInOrder(orderId, eventId);
        
                response.Report.push({
                orderNumber: order._id,
                name: user.firstName + " " + user.lastName,
                quantity: totalTickets,
                price: order.total,
                date: order.createdAt,
                });
        
                // console.log(response.Report);
            }
        
            try {
                res.status(200).json(response);
            } catch (err) {
                res.status(400).json({ message: "Error in getting the order summary report" });
            }
};

// create a function for sales summary report
exports.getSalesSummaryReport=async(req,res)=>{
            //event id in the request params
            const eventId = req.params.eventId;
            if (!req.user) {
                return res.status(401).json({ message: "You are not logged in" });
            }
            //check that the user is a creator
            //and this user is the creator of the event
            if (req.user.isCreator == false) {
                return res.status(401).json({ message: "You are not a creator" });
            }
            //check if the event exists
            if (!eventId) {
                return res.status(400).json({ message: "Event doesn't exist" });
            }

            const event=await Event.findById(eventId);
            if(!event){
                return res.status(400).json({ message: "Event doesn't exist" });
            }
        
            if (event.createdBy && event.createdBy != req.user._id) {
                return res.status(401).json({ message: "You are not the creator of this event" });
            }
            if(typeof event.createdBy === 'undefined'){
                return res.status(401).json({ message: "You are not the creator of this event" });
            }

            // const orders = await Order.find({ event: eventId });

            const totalOrders = await getOrdersCount(eventId);
            const totalTickets = await getTicketsSold(eventId);

            // net sales is the sales without the discount
            // gross sales is the total money earned

            const grossSales = await getTotalMoneyEarned(eventId);
            const netSales = await getNetSales(eventId);

            //initialize the response object
            const response = {
                totalOrders: totalOrders,
                totalSoldTickets: totalTickets,
                grossSales: grossSales,
                netSales: netSales
            };

            // try to send the response
            try {
                res.status(200).json(response);
            }
            //catch any errors
            catch (err) {
                res.status(400).json({ message: "Error in getting the sales summary report" });
            }

};
