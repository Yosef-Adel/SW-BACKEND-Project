const Order = require('../models/Order');


// @route   POST api/orders/:event_id
// @desc    Create a new order
// @access  Public
const createOrder=async (req, res, next ) => {

    //event id is in the parameters
    const eventId = req.params.event_id;

    //user id is in the request
    //in case the user is logged in (authorized)
    const userId = req.user._id;

    const {ticketsBought,subTotal,fees,discountAmount,total} = req.body;

    //create a new order
    const order = new Order({
        eventId,
        userId,
        ticketsBought,
        subTotal,
        fees,
        discountAmount,
        total
    });

    //save the order
    try {
        await order.save();
        res.status(201).json({message: "Order created successfully!"});
    } catch (err) {
        res.status(500).json({message: "Order creation failed!"});
    }

    next();
}





module.exports={createOrder}