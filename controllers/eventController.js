const Event = require('../models/Events');
const Category = require('../models/Category');
const TicketClass = require('../models/Tickets');
const Order = require('../models/Order');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Readable,pipeline } = require('stream');
// import { Parser } from 'json2csv';
const { downloadResource } = require ('../utils/exportCSV');

const {generateQRCodeAndSendEmail}=require('../controllers/qrCodeController');

const User = require('../models/User');
const axios = require('axios');
const mongoose = require('mongoose');
const Date = require('date.js');

const {getTicketsSold, getOrdersCount, getTotalCapacity, getTotalMoneyEarned, getTotalTicketsInOrder, getTotalTicketCapacity, getFreeTicketsSold, getPaidTicketsSold,getSumofTicketsBoughtArray} = require('./aggregateFunctions');
const Ticket = require('../models/Tickets');
const Organization = require('../models/Organization');
// const { CsvWriter } = require('csv-writer/src/lib/csv-writer');



// @route   Create api/events/
// @desc    Create event
// @access  Public
exports.create = async (req, res) => {
    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    // Check if category exists
    const category = req.body.category;
    const categoryObject = await Category.exists({ id: category });
    if (!categoryObject) {
        return res.status(400).json({ message: "Category does not exist" });
    }

    const missingFieldErrorMessage = "field is required";
    const field = ["name", "startDate", "endDate", "hostedBy", "category", "description", "summary"];
    for (let i = 0; i < field.length; i++) {
        if (!req.body[field[i]]) {
            return res.status(400).json({ message: field[i] + " " + missingFieldErrorMessage });
        }
    }
    // {
    //     "name": "Ola's venue",
    //     "city": "Cairo",
    //     "address1":"ay address 1 talet",
    //     "country":"Egypt",
    //     "postalCode":"111111",
    //     "longitude": 30.123,
    //     "latitude": 30.123
    //     "capacity": 100
    // }
    // const venueFields = ["name", "city", "address1", "country", "postalCode", "longitude", "latitude", "capacity"];
    // for (let i = 0; i < venueFields.length; i++) {
    //     if (!req.body.venue[venueFields[i]]) {
    //         return res.status(400).json({ message: venueFields[i] + " " + missingFieldErrorMessage });
    //     }
    // }

    

    const newEvent = await Event.create({...req.body});
    // Create event
    // const newEvent = new Event({
    //     name: req.body.name,
    //     description: req.body.description,
    //     startDate: req.body.startDate,
    //     endDate: req.body.endDate,
    //     venue: req.body.venue,
    //     category: req.body.category,
    //     capacity: req.body.capacity,
    //     summary: req.body.summary,
    //     hostedBy: req.body.hostedBy,
    //     isPrivate: req.body.isPrivate,
    //     password: req.body.password,
    //     publishDate: req.body.publishDate
    // });

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

    const eventQuery = Event.find({isPrivate: false}).populate('category');
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

    eventQuery.then(events => res.json({ city, events}))
        .catch(err => res.status(400).json(err));

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

// @route   PUT api/events/:id
// @desc    Update event by id
// @access  Public
exports.update = async (req, res) => {
    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    const event = await Event.findById(req.params.id);
    // this includes new updates only and removes older info, take care
    // consider this
    
    const updates = Object.keys(req.body);
    updates.forEach((element) => (event[element] = req.body[element]));

    // for (const key in req.body) {
    //     event[key] = req.body[key];
    // }
    
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
exports.delete = async(req, res) => {
    try{
        // check if the user is authorized
        if (!req.isCreator){
            return res.status(400).json({message: "You are not a creator"});
        }
        const event = await Event.findById(req.params.id);
        if (!event)
        {
            return res.status(400).json({message: "Event doesn't exist"});
        }
        const ticketsArray = event.tickets;
        console.log(ticketsArray);
        for (let i=0; i< ticketsArray.length; i++){
            const ticket = await TicketClass.deleteOne(ticketsArray[i]);
            if (!ticket){
                return res.status(400).json({message: "Ticket not found"});
            }
        };
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
    
    const events = await Event.find({ "venue.city": city, isPrivate: false }).populate('category');
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

        let eventURL="http://ec2-3-219-197-102.compute-1.amazonaws.com/events/"+event;

        //sending the mail to the email specified in the order form
        await generateQRCodeAndSendEmail(eventURL,user._id,order.email,ticketDetails);

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

exports.getUserEvents = async(req,res) => {
    try{
        if (!req.isCreator)
        {
            return res.status(400).json({message: "You are not a creator"})
        }
        const user = mongoose.Types.ObjectId(req.params.userId);

        const userOrganization = await Organization.findOne({"createdBy": user})
        if (!userOrganization){
            return res.status(400).json({message: "This user doesn't have an organization."})
        }
        const organizersArray = userOrganization.organizers;

        if (!organizersArray){
            return res.status(400).json({message: "This organization doesn't have any organizers."})
        }
        
        const userEvents = [];
        for (let i=0; i< organizersArray.length; i++){
            const events = await Event.find({"hostedBy": organizersArray[i]});
            for (let event of events)
            {
                userEvents.push(event);
            }
        }
        
        if (userEvents.length == 0){
            return res.status(400).json({message: "No events created by this user"});
        }
        
        return res.status(200).json({message: "Success", userEvents});
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in getting user events"})
    }
}

exports.getUserPastEvents = async(req, res) => {
    try{
        if (!req.isCreator)
        {
            return res.status(400).json({message: "You are not a creator"})
        }

        const user = mongoose.Types.ObjectId(req.params.userId);

        const userOrganization = await Organization.findOne({"createdBy": user})
        if (!userOrganization){
            return res.status(400).json({message: "This user doesn't have an organization."})
        }
        const organizersArray = userOrganization.organizers;

        if (!organizersArray){
            return res.status(400).json({message: "This organization doesn't have any organizers."})
        }
        
        const userEvents = [];
        const currDate = new Date();
        for (let i=0; i< organizersArray.length; i++){
            const events = await Event.find({"hostedBy": organizersArray[i]});
            // console.log(events);
            for (let event of events)
            {
                console.log(event);
                if (event.startDate < currDate)
                {
                    userEvents.push(event);
                }
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
        const user = mongoose.Types.ObjectId(req.params.userId);

        const userOrganization = await Organization.findOne({"createdBy": user})
        if (!userOrganization){
            return res.status(400).json({message: "This user doesn't have an organization."})
        }
        const organizersArray = userOrganization.organizers;

        if (!organizersArray){
            return res.status(400).json({message: "This organization doesn't have any organizers."})
        }
        
        const userEvents = [];
        const currDate = new Date();
        for (let i=0; i< organizersArray.length; i++){
            const events = await Event.find({"hostedBy": organizersArray[i]});
            // console.log(events);
            for (let event of events)
            {
                console.log(event);
                if (event.startDate > currDate)
                {
                    userEvents.push(event);
                }
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

    //get the order count
    const orderCount = await getOrdersCount(eventId);

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
    };

    //loop through every order with the event id
    //and get to the tickets array
    //I want to see the number of tickets for each order and the type
    const event = await Event.findById(eventId);
    var attendeeStatus="";

    const orders=await Order.find({event:eventId});
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
        return res.status(400).json({ message: "Event doesn't exist" });
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
    const orderLimit = parseInt(req.query.orderLimit) || 10; // extract limit from query parameters or default to 10
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
    const event=await Event.findById(eventId);
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
    const limit = parseInt(req.query.limit) || 10; // extract limit from query parameters or default to 10

    if (!req.user) {
        return res.status(401).json({ message: "You are not logged in" });
    }

    if (req.user.isCreator === false) {
        return res.status(401).json({ message: "You are not a creator" });
    }

    if (!eventId) {
        return res.status(400).json({ message: "Event doesn't exist" });
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
                    return res.status(400).json({ message: "Event doesn't exist" });
                }

                //return the event url
                try 
                {
                    const url = "https://d1a3ozfbtcn1f.cloudfront.net/user/event/"+eventId;
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
                return res.status(400).json({ message: "Event doesn't exist" });
            }

            //get the total sold tickets count
            const soldTickets=await getTicketsSold(eventId);

            const event=await Event.findById(eventId);
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
