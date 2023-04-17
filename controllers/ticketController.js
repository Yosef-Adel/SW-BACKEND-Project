
const Ticket = require('../models/Tickets');
const Event = require('../models/Events');


//@route POST api/ticket/:event_id
//@desc create a new ticket
//@access public
const createTicket = async (req, res, next ) => {

    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }

    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }


    //check on all fields
    //check if string is empty
    //check if number doesn't exist
    //zero is fine
    //only give error when the field is not there
    if (!req.body.name || !req.body.type || req.body.capacity==NaN || req.body.minQuantityPerOrder==NaN || req.body.maxQuantityPerOrder==NaN || req.body.salesStart==NaN || req.body.salesEnd==NaN) {
        return res.status(400).json({ message: "All fields are required." });
    }

    let ticketPrice=0;
    let ticketFee=0;

    if (req.body.type=="Free") {
        ticketPrice=0;
        ticketFee=0;
    }
    else if (req.body.type=="Paid") {
        if (req.body.price==NaN) {
            return res.status(400).json({ message: "All fields are required." });
        }
        ticketPrice=req.body.price;
        //calculate the fee of the ticket using the equation
        ticketFee=(ticketPrice * 0.037)+(1.79)+(ticketPrice * 0.029);
        ticketFee=ticketFee.toFixed(2);
    }


    let event = await Event.findById(req.params.event_id);
    if (!event) {
        return res.status(400).json({ message: "Event not found." });
    }

    /////////////////////////////////check on the event capacity/////////////////////////////////////
    let eventCapacity = event.capacity;
    //loop through the tickets of the event and sum the capacities
    //not tested yet
    let tickets = event.tickets;
    let totalCapacity = req.body.capacity;
    for (let i = 0; i < tickets.length; i++) {
        let ticket = await Ticket.findById(tickets[i]);
        totalCapacity += ticket.capacity;
    }
    //check if the total capacity of the tickets is less than the event capacity
    if (totalCapacity > eventCapacity) {
        return res.status(400).json({ message: "The total capacity of the tickets is greater than the event capacity." });
    }
    if (req.body.description) {
        ticketDescription = req.body.description;
    }
    else {
        ticketDescription = "";
    }


    try {
        const ticket = new Ticket({
        event: req.params.event_id,
        name: req.body.name,
        type: req.body.type,
        price: ticketPrice,
        fee: ticketFee,
        capacity: req.body.capacity,
        minQuantityPerOrder: req.body.minQuantityPerOrder,
        maxQuantityPerOrder: req.body.maxQuantityPerOrder,
        salesStart: new Date(req.body.salesStart),
        salesEnd: new Date(req.body.salesEnd),
        description: ticketDescription
        });
        await ticket.save();
        //add the ticket to the event
        event.tickets.push(ticket);
        //update the event price
        if (event.price==-1 || event.price>ticket.price) {
            event.price=ticket.price;
        }
        await event.save();
        res.status(201).json({ message: "Ticket created successfully!" });
    }
    
    catch (err) {
        return res.status(400).json({ message: err.message });
    }

}

//retrieve ticket class by id
const getTicketById = async (req, res, next) => {
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }

    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    try {
        const ticket = await Ticket.findById(req.params.ticket_id);
        if (!ticket) {
            return res.status(400).json({ message: "Ticket not found." });
        }
        res.status(200).json({ ticket: ticket });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }

};

//deleting a ticket class by id
const deleteTicketById = async (req, res, next) => {
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }

    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    try {
        const ticket = await Ticket.findById(req.params.ticket_id);
        if (!ticket) {
            return res.status(400).json({ message: "Ticket not found." });
        }
        await ticket.remove();
        res.status(200).json({ message: "Ticket deleted successfully!",
        ticket: ticket
    });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

//list the tickets of a certain event
//all the tickets, available or unavailable
const getAllTicketsByEventId = async (req, res, next) => {
    // if (!(req.user)) {
    //     return res.status(400).json({ message: "User is not logged in." });
    // }

    // //check if the user is a creator or not since only creators can view tickets
    // if (!req.isCreator) {
    //     return res.status(400).json({ message: "User is not a creator." });
    // }

    try {
        const tickets = await Ticket.find({event: req.params.event_id});
        if (!tickets) {
            return res.status(400).json({ message: "Tickets not found." });
        }
        res.status(200).json({ tickets: tickets });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};


//get only the available tickets by event id
//the available tickets are the ones
//capacity>sold
//start date is before now
//end date is after now
const getAvailableTicketsByEventId = async (req, res, next) => {
    // if (!(req.user)) {
    //     return res.status(400).json({ message: "User is not logged in." });
    // }

    // //check if the user is a creator or not since only creators can view tickets
    // if (!req.isCreator) {
    //     return res.status(400).json({ message: "User is not a creator." });
    // }

    try {
        const tickets = await Ticket.find({event: req.params.event_id});
        if (!tickets) {
            return res.status(400).json({ message: "Tickets not found." });
        }
        // console.log(tickets);
        let availableTickets = [];
        let count = 0;
        //check for each ticket if it is available or not
        for (let i = 0; i < tickets.length; i++) {
            if (tickets[i].capacity > tickets[i].sold && tickets[i].salesStart < Date.now() && tickets[i].salesEnd > Date.now()) {
                availableTickets[count] = tickets[i];
                count++;
            }
        }
        res.status(200).json({ message: "Available tickets retrieved successfully!",
            tickets: availableTickets 
        });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

//edit a ticket class by id
const editTicketById = async (req, res, next) => {
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }

    // check if the user is authorized
    if (!req.isCreator){
        return res.status(400).json({message: "You are not a creator"});
    }

    //find the ticket by id in parameters and only update the fields that are sent
    try {
        const ticket = await Ticket.findById(req.params.ticket_id);
        if (!ticket) {
            return res.status(400).json({ message: "Ticket not found." });
        }
        if (req.body.name) {
            ticket.name = req.body.name;
        }
        if (req.body.type) {
            ticket.type = req.body.type;
        }
        if (req.body.price) {
            ticket.price = req.body.price;
            //update the fee using the equation plugging in the updated price
            ticket.fee=(req.body.price * 0.037)+(1.79)+(req.body.price * 0.029);
            //fix the fee to 2 decimal places
            ticket.fee = ticket.fee.toFixed(2);


        }
        if (req.body.capacity) {
            ticket.capacity = req.body.capacity;
        }
        if (req.body.minQuantityPerOrder) {
            ticket.minQuantityPerOrder = req.body.minQuantityPerOrder;
        }
        if (req.body.maxQuantityPerOrder) {
            ticket.maxQuantityPerOrder = req.body.maxQuantityPerOrder;
        }
        if (req.body.salesStart) {
            ticket.salesStart = new Date(req.body.salesStart);
        }
        if (req.body.salesEnd) {
            ticket.salesEnd = new Date(req.body.salesEnd);
        }
        if (req.body.description) {
            ticket.description = req.body.description;
        }
        await ticket.save();
        res.status(200).json({ message: "Ticket edited successfully!",
        ticket: ticket
    });
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }

};



module.exports = {createTicket, getTicketById, deleteTicketById, getAllTicketsByEventId, editTicketById, getAvailableTicketsByEventId};