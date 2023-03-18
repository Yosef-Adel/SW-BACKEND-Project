const { boolean } = require('joi');
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

    //will only take the tickets bought array from the request
    //the rest will be calculated and returned in the response
    const {ticketsBought,promocode} = req.body;

    //initialization of everything that will be calculated
    let totalTickets = 0;
    let subTotal = 0;
    let totalFees = 0;
    let totalDiscountAmount = 0;
    let total = 0;

    //loop through the tickets bought array
    for(let i=0; i<ticketsBought.length; i++){
        //the ticket class id
        const ticketClassId = ticketsBought[i].ticketClass;
        //the number of tickets bought
        const numberOfTicketsBought = ticketsBought[i].number;
        //populate the ticket class
        await ticketClassId.populate('ticketClass').execPopulate();

        
        ////////////////////////////////////Availablity Check/////////////////////////////////////
        //check if the ticket class is available
        //check on the start date and end date of ticket class
        if(ticketClassId.capacity < numberOfTicketsBought || ticketClassId.startDate > Date.now() || ticketClassId.endDate < Date.now()){
            return res.status(500).json({message: "Ticket Class not available!"});
        }

        //check on the min and max quantity per order
        if(numberOfTicketsBought < ticketClassId.minQuantityPerOrder || numberOfTicketsBought > ticketClassId.maxQuantityPerOrder){
            return res.status(500).json({message: "Number of tickets bought is not in the range of min and max quantity per order!"});
        }

        //update the capacity of the ticket class
        ticketClassId.capacity -= numberOfTicketsBought;

        //save the ticket class
        try {
            await ticketClassId.save();
        } catch (err) {
            return res.status(500).json({message: "Ticket Class update failed!"});
        }

        ticketPrice = ticketClassId.price;
        ticketFee = ticketClassId.fee;
        ////////////////////////////////////Promocode check/////////////////////////////////////
        //check if there was a promocode
        if(promocode){
            //populate the promocode to get all the info from its id
            await promocode.populate('promocode').execPopulate();
            //check if the promocode is valid
            //check on the start and end dates
            //check on the limit of uses and the number of uses
            if(promocode.startDate > Date.now() || promocode.endDate < Date.now() || promocode.used <= promocode.limit){
                return res.status(500).json({message: "Promocode not available!"});
            }
            //update the number of uses of the promocode
            promocode.numberOfUses += 1;
            //save the promocode
            try {
                await promocode.save();
            }
            catch (err) {
                return res.status(500).json({message: "Promocode update failed!"});
            }
            //update the ticket ticket price
            ticketPrice = ticketPrice - (ticketPrice * promocode.percentOff);
        }
        //Update the total number of tickets
        totalTickets += numberOfTicketsBought;
        //Update the subtotal
        subTotal += ticketPrice * numberOfTicketsBought;
        //Update the total fees
        totalFees += ticketFee * numberOfTicketsBought;
        //Update the total discount amount
        totalDiscountAmount += (ticketClassId.price - ticketPrice) * numberOfTicketsBought;
        //Update the total
        total += subTotal + totalFees - totalDiscountAmount;
    }

    //create a new order
    const order = new Order({
        event: eventId,
        user: userId,
        ticketsBought: ticketsBought,
        promocode: promocode,
        subTotal: subTotal,
        fees: totalFees,
        discountAmount: totalDiscountAmount,
        total: total
    });

    //save the order
    try {
        await order.save();
        res.status(201).json({message: "Order created successfully!",
        order: order
        });
    } catch (err) {
        res.status(500).json({message: "Order creation failed!"});
    }

    next();
}

module.exports={createOrder}