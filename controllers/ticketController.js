
const Ticket = require('../models/Tickets');
const Event = require('../models/Events');


//@route POST api/ticket/:event_id
//@desc create a new ticket
//@access public
const createTicket = async (req, res, next ) => {

    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //check if the user is a creator or not since only creators can create tickets
    if (!req.isCreator) {
        return res.status(400).json({ message: "User is not a creator." });
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
    if (totalCapacity >= eventCapacity) {
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
        res.status(201).json({ message: "Ticket created successfully!" });
    }
    
    catch (err) {
        return res.status(400).json({ message: err.message });
    }

}


module.exports = {createTicket};