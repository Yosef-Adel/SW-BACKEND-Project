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
const createOrder=async (req, res ) => {

    //event id is in the parameters
    const eventId = req.params.event_id;

    //user id is in the request
    //in case the user is logged in (authorized)    
    const userId = req.user._id;

    //will only take the tickets bought array from the request
    //the rest will be calculated and returned in the response
    const {ticketsBought,promocode} = req.body;

    //initialization of everything that will be calculated
    let totalTickets = 0;
    let subTotal = 0.00;
    let totalFees = 0.00;
    let totalDiscountAmount = 0.00;
    let total = 0.00;
    let isTicketClassAvailable=true;
    let isNumberOfTicketsBoughtInRange=true;
    let isPromocodeAvailable=true;
    let doesPromocodeExist=true;

    //loop through the tickets bought array
    for(let i=0; i< ticketsBought.length; i++){
        //the ticket class id
        const ticketClassId = ticketsBought[i].ticketClass;
        //the number of tickets bought
        const numberOfTicketsBought = ticketsBought[i].number;
        let ticketPriceOriginal = 0.00;
        let ticketPrice = 0.00;
        let ticketFee = 0.00;
        //find the ticket class by id 
        //and get the ticket class object
        let ticketClass = await TicketClass.findById(ticketClassId);
        if(ticketClass){
            ///////////////////////////////////Availablity Check/////////////////////////////////////
            //check if the ticket class is available
            //check on the start date and end date of ticket class
            if(ticketClass.capacity < numberOfTicketsBought || ticketClass.salesStart > Date.now() || ticketClass.salesEnd < Date.now()){
                isTicketClassAvailable=false;
                break;
            }

            //check on the min and max quantity per order
            if((numberOfTicketsBought!=0 && numberOfTicketsBought < ticketClass.minQuantityPerOrder) || numberOfTicketsBought > ticketClass.maxQuantityPerOrder){
                isNumberOfTicketsBoughtInRange=false;
                break;
            }

            // //update the capacity of the ticket class
            // ticketClass.capacity -= numberOfTicketsBought;

            //update the number of tickets sold
            ticketClass.sold += numberOfTicketsBought;

            //save the ticket class
            try {
                await ticketClass.save();
            } catch (err) {
                return res.status(500).json({message: "Ticket Class update failed!"});
            }

            ticketPriceOriginal = ticketClass.price;
            ticketPrice = ticketClass.price;
            ticketFee = ticketClass.fee;
        }
        
        ////////////////////////////////////Promocode check/////////////////////////////////////
        //check if there was a promocode
        if(promocode){
            //populate the promocode to get all the info from its id
            let promocodeObject = await Promocode.findById(promocode) 
            if(promocodeObject){
                //check if the promocode is valid
                //check on the start and end dates
                //check on the limit of uses and the number of uses
                if(promocodeObject.used >= promocodeObject.limit || promocodeObject.startDate > Date.now() || promocodeObject.endDate < Date.now()){
                    isPromocodeAvailable=false;
                    break;
                }
            }
            else{
                //if the promocode is not found
                //send a message that the promocode is not available
                doesPromocodeExist=false;
                break;
            }


            if (doesPromocodeExist && isPromocodeAvailable){
                //search in the array of ticket classes in the promocode model
                //to see if the ticket class is in the array
                let isTicketClassInPromocode = promocodeObject.tickets.includes(ticketClassId);
                //if the ticket class is in the array and the ticket is paid not free
                //update the ticket price
                if(isTicketClassInPromocode && ticketPriceOriginal!=0){
                    //update the number of uses of the promocode
                    promocodeObject.used += 1;
                    //save the promocode
                    try {
                        await promocodeObject.save();
                        }
                    catch (err) {
                        return res.status(500).json({message: "Promocode update failed!"});
                        }
                        if(promocodeObject.amountOff==-1){
                            //then use the percent off not the amount off
                            ticketPrice = ticketPriceOriginal - (ticketPriceOriginal * (promocodeObject.percentOff/100));
                        }
                        else if (promocodeObject.percentOff==-1){
                            //then use the amount off not the percent off
                            ticketPrice = ticketPriceOriginal - promocodeObject.amountOff;
                        }
                    
                }
                    //Update the total number of tickets
                    totalTickets += numberOfTicketsBought;
                    //Update the subtotal
                    subTotal += ticketPriceOriginal * numberOfTicketsBought;
                    //Update the total fees
                    totalFees += ticketFee * numberOfTicketsBought;
                    //Update the total discount amount
                    totalDiscountAmount += (ticketPriceOriginal - ticketPrice) * numberOfTicketsBought;
            }
        }     
    }

    //check if promocode exists
    if(!doesPromocodeExist){
        return res.status(500).json({message: "Promocode not found!"});
    }
    //check if the ticket class is available
    if(!isTicketClassAvailable){
        return res.status(500).json({message: "Ticket Class not available!"});
    }

    //check if the number of tickets bought is in range
    if(!isNumberOfTicketsBoughtInRange){
        return res.status(500).json({message: "Number of tickets bought is not in range!"});
    }

    //check if the promocode is available
    if(!isPromocodeAvailable){
        return res.status(500).json({message: "Promocode not available!"});
    }

    //calculate the total
    total = subTotal + totalFees - totalDiscountAmount;

    //create a new order
    const order = new Order({
        event: eventId,
        user: userId,
        ticketsBought: ticketsBought,
        promocode: promocode,
        subTotal: subTotal,
        fees: totalFees,
        discountAmount: totalDiscountAmount,
        total: total,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    });

    //save the order
    try {
        await order.save();
        //generate the qr code and send the email to the user with link to the event

        //plugin the deployed url
        let eventURL="http://ec2-3-219-197-102.compute-1.amazonaws.com/api/events/"+eventId;
        // let eventURL=process.env.CURRENTURL+"events/"+eventId;
        await generateQRCodeAndSendEmail(eventURL,req.user._id);

        res.status(201).json({message: "Order created successfully!",
        order: order
        });
        

    } catch (err) {
        res.status(500).json({message: "Order creation failed!"});
    }

}

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

//cancel an order
const cancelOrder=async (req,res)=>{
    //check on the user
    if(!(req.user)){
        return res.status(400).json({message: "User is not logged in."});
    }
    //the user can only cancel his own order
    if(req.user._id!=req.params.user_id){
        return res.status(400).json({message: "You can only cancel your own orders."});
    }
    //get the order id from the parameters
    const orderId=req.params.order_id;
    //get the order
    const order = await Order.findById(orderId);
    if(!order){
        return res.status(404).json({message: "Order not found!"});
    }
    //loop through the tickets and decrease the sold by the number of tickets bought
    for(let i=0;i<order.ticketsBought.length;i++){
        const ticketClass=await TicketClass.findById(order.ticketsBought[i].ticketClass);
        if(ticketClass){
            ticketClass.sold=ticketClass.sold-order.ticketsBought[i].number;
            await ticketClass.save();
        }
    }
    //the promocode used will not be updated
    //assumption that it is already used and the action is not reversible
    // //check if there is a promocode applied
    // if(order.promocode){
    //     //find the promocode by id and decrease the used count
    //     const promocode=await Promocode.findById(order.promocode);
    //     promocode.used=promocode.used-1;
    //     await promocode.save();
    // }

    //delete the order
    try{
        await Order.findByIdAndDelete(orderId);
        res.status(200).json({message: "Order cancelled successfully!",
        order: order});
    }
    catch(err){
        res.status(500).json({message: "Error cancelling order!"});
    }
};

module.exports={createOrder,getOrdersByEventId,getOrderById,getOrdersByUserId,cancelOrder}