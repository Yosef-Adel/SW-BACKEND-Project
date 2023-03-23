
const Ticket = require('../models/Tickets');


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
    if (!(req.body.name && req.body.type && req.body.price && req.body.fee && req.body.capacity && req.body.minQuantityPerOrder && req.body.maxQuantityPerOrder && req.body.salesStart && req.body.salesEnd)) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const ticket = new Ticket({
        event: req.params.event_id,
        name: req.body.name,
        type: req.body.type,
        price: req.body.price,
        fee: req.body.fee,
        capacity: req.body.capacity,
        minQuantityPerOrder: req.body.minQuantityPerOrder,
        maxQuantityPerOrder: req.body.maxQuantityPerOrder,
        salesStart: new Date(req.body.salesStart),
        salesEnd: new Date(req.body.salesEnd)
        });
        await ticket.save();
        res.status(201).json({ message: "Ticket created successfully!" });
    }
    
    catch (err) {
        return res.status(400).json({ message: err.message });
    }

}


module.exports = {createTicket};