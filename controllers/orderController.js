const { boolean, date } = require('joi');
const Order = require('../models/Order');
const TicketClass = require('../models/Tickets');
const Event = require('../models/Events');
const Promocode = require('../models/Promocode');

//require the function in the qr code controller 
const {generateQRCodeAndSendEmail}=require('../controllers/qrCodeController');



// @route   POST api/orders/:event_id
// @desc    Create a new order
// @access  Public

//everything will be calculated on in the frontend 
//the final calculation will be sent to the backend and stored
const createOrder=async (req, res ) => {

    //event id is in the parameters
    const eventId = req.params.event_id;

    //user id is in the request
    //in case the user is logged in (authorized)    
    const userId = req.user._id;

    //check for the fields in the body
    if (!req.body.ticketsBought || !req.body.subTotal || !req.body.fees || !req.body.total) {
        return res.status(400).json({ message: "All fields are required." });
    }
    if(req.body.promocode && !req.body.discountAmount){
        return res.status(400).json({ message: "Discount amount is required." });
    }

    let order;
    if(req.body.promocode && req.body.discountAmount){
        order = new Order({
            event: eventId,
            user: userId,
            ticketsBought: req.body.ticketsBought,
            promocode: req.body.promocode,
            //calculated in the frontend
            subTotal: req.body.subTotal,
            fees: req.body.fees,
            discountAmount: req.body.discountAmount,
            total: req.body.total
        });
    }
    else{
        order = new Order({
            event: eventId,
            user: userId,
            ticketsBought: req.body.ticketsBought,
            //calculated in the frontend
            subTotal: req.body.subTotal,
            fees: req.body.fees,
            discountAmount: 0,
            total: req.body.total
        });

    }

    //save the order
    try {
        await order.save();
        //save the order in the event database
        //get the event and add the order to the orders array
        
        
        //generate the qr code and send the email

        //plugin the deployed url
        // let eventURL="https://sw-backend-project.vercel.app/events/"+eventId;
        let eventURL=process.env.CURRENTURL+"events/"+eventId;
        await generateQRCodeAndSendEmail(eventURL,req.user._id);

        res.status(201).json({message: "Order created successfully!",
        order: order
        });
        

    } catch (err) {
        res.status(500).json({message: "Order creation failed!"});
    }

};

//get all orders of a certain event
const getOrdersByEventId=async (req,res)=>{
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //get the event id from the parameters
    const eventId=req.params.event_id;

    //get all the orders of the event
    try{
        const orders= await Order.find({event: eventId});
        res.status(200).json({message: "Orders fetched successfully!",
        orders: orders
        });

    }
    catch(err){
        res.status(500).json({message: "Error getting orders!"});
    }


};

//get an order by order id
const getOrderById=async (req,res)=>{
    if (!(req.user)) {
        return res.status(400).json({ message: "User is not logged in." });
    }
    //get the order id from the parameters
    const orderId=req.params.order_id;
    const order= await Order.findById(orderId);
    if(!order){
        return res.status(404).json({message: "Order not found!"});
    }
    res.status(200).json({message: "Order fetched successfully!",
    order: order
    });
};

//get all orders of a certain user
const getOrdersByUserId=async (req,res)=>{
    if(!(req.user)){
        return res.status(400).json({message: "User is not logged in."});
    }
    if(req.user._id!=req.params.user_id){
        return res.status(400).json({message: "You can only view your own orders."});
    }
    //get the user id from the parameters
    const userId=req.params.user_id;
    try{
        const order= await Order.find({user: userId});
        if (!order) {
            return res.status(404).json({ message: "No orders found." });
        }
        res.status(200).json({message: "Orders fetched successfully!",
        orders: order
        });
    }
    catch(err){
        res.status(500).json({message: "Error getting orders!"});
    }

};


module.exports={createOrder,getOrdersByEventId,getOrderById,getOrdersByUserId}