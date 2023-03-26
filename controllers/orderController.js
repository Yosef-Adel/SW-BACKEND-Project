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

            //update the capacity of the ticket class
            ticketClass.capacity -= numberOfTicketsBought;

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
            };

            //search in the array of ticket classes in the promocode model
            //to see if the ticket class is in the array
            let isTicketClassInPromocode = promocodeObject.tickets.includes(ticketClassId);
            //if the ticket class is in the array
            //update the ticket price
            if(isTicketClassInPromocode){
                //update the number of uses of the promocode
                promocodeObject.used += 1;
                //save the promocode
                try {
                    await promocodeObject.save();
                    }
                catch (err) {
                    return res.status(500).json({message: "Promocode update failed!"});
                    }
                ticketPrice = ticketPriceOriginal - (ticketPriceOriginal * (promocodeObject.percentOff/100));
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
        total: total
    });

    //save the order
    try {
        await order.save();
        //generate the qr code and send the email

        //testing
        // let eventURL=process.env.CURRENTURL+"events/"+eventId;
        // await generateQRCodeAndSendEmail(eventURL,req.user._id);
        //testing

        res.status(201).json({message: "Order created successfully!",
        order: order
        });
        

    } catch (err) {
        res.status(500).json({message: "Order creation failed!"});
    }

}

module.exports={createOrder}