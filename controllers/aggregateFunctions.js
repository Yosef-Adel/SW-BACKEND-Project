//require the event model
const Event = require('../models/Events');
//require the promocode model
const Promocode = require('../models/Promocode');
//require the order model
const Order = require('../models/Order');
//require the ticket model
const Ticket = require('../models/Tickets');
//require the user model
const User = require('../models/User');
//require mongoose
const mongoose = require('mongoose');

//creating an aggregate function to get the total number of tickets sold for a specific event
//it is just a helper function to be used in the another function
//will get the event id and return the number of tickets sold
const getTicketsSold = async (event_id) => {
    try{
        const result=await Ticket.aggregate([
            //match the event id filters the tickets by the specified event
            {
                $match: {
                    event: mongoose.Types.ObjectId(event_id)
                }
            },
            //group the tickets by event and sum the sold tickets
            //summing the sold field
            {
                $group: {
                    _id: "$event",
                    ticketsSold: {
                        $sum: "$sold"
                    }
                }
            }
        ]);
        //the result of the aggregation is an array of objects
        //the first object is the one we want
        ///the ticketsSold field is the one we want
        return result.length > 0 ? result[0].ticketsSold : 0;
    }
    catch(err){
        return err.message;
    }
};

//aggregate function to get the count of the orders for a specific event
//it is just a helper function to be used in the another function
//will get the event id and return the number of orders
const getOrdersCount = async (event_id) => {
    try{
        const result=await Order.aggregate([
            //match the event id filters the orders by the specified event
            {
                $match: {
                    event: mongoose.Types.ObjectId(event_id)
                }
            },
            //group the orders by event and count the orders
            {
                $group: {
                    _id: "$event",
                    ordersCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        return result.length > 0 ? result[0].ordersCount : 0;

    }
    catch(err){
        return err.message;
    }
};

//aggregate function to get the total number of tickets (summing the capacities of all tickets of a certain event)
//it is just a helper function to be used in the another function
//will get the event id and return the number of tickets
const getTotalCapacity = async (event_id) => {
    try{
        const result=await Ticket.aggregate([
            //match the event id filters the tickets by the specified event
            {
                $match: {
                    event: mongoose.Types.ObjectId(event_id)
                }
            },
            //group the tickets by event and sum the capacities
            //summing the capacity field
            {
                $group: {
                    _id: "$event",
                    ticketsCount: {
                        $sum: "$capacity"
                    }
                }
            }
        ]);
        //the result of the aggregation is an array of objects
        return result.length > 0 ? result[0].ticketsCount : 0;
    }
    catch(err){
        return err.message;
    }
};

//aggregate function to count the total money earned by an event
//summ the total field in all orders of a certain event
//will get the event id and return the total money earned
const getTotalMoneyEarned = async (event_id) => {
    try{
        const result=await Order.aggregate([
            //match the event id filters the orders by the specified event
            {
                $match: {
                    event: mongoose.Types.ObjectId(event_id)
                }
            },
            //group the orders by event and sum the total field
            {
                $group: {
                    _id: "$event",
                    totalMoneyEarned: {
                        $sum: "$total"
                    }
                }
            }
        ]);
        //the result of the aggregation is an array of objects
        return result.length > 0 ? result[0].totalMoneyEarned : 0;
    }
    catch(err){
        return err.message;
    }
};

//aggregate function to get the total number of tickets in a certain order
//loop through the ticketsBought array and sum the number field
//will get the order id and event id and return the total number of tickets
//the order has to be related to a certain event
const getTotalTicketsInOrder = async (order_id, event_id) => {
    try{
        const result=await Order.aggregate([
            //match both the event id and the order id
            {
                $match: {
                    event: mongoose.Types.ObjectId(event_id),
                    _id: mongoose.Types.ObjectId(order_id)
                }
            },
            //unwind the ticketsBought array
            {
                $unwind: "$ticketsBought"
            },
            //sum the number field
            //group by the order id
            {
                $group: {
                    _id: "$_id",
                    totalTickets: {
                        $sum: "$ticketsBought.number"
                    }
                }
            }
        ]);
        //the result of the aggregation is an array of objects
        return result.length > 0 ? result[0].totalTickets : 0;
    }
    catch(err){
        return err.message;
    }     
};

// create an aggregate function to loop through the tickets of an event and sum their capacities
const getTotalTicketCapacity = async (eventId) => {
    const totalTicketCapacity = await Ticket.aggregate([
        {
            $match: { event: eventId }
        },
        {
            $group: {
                _id: "$event",
                ticketsCount: {
                    $sum: "$capacity"
                }
            }
        }
    ]);
    return totalTicketCapacity.length > 0 ? totalTicketCapacity[0].ticketsCount : 0;
};

//create an aggregate function to get the number of free tickets sold for an event
//will get the event id and return the number of free tickets sold
const getFreeTicketsSold = async (event_id) => {
    try{
        const result=await Ticket.aggregate([
            //match the event id filters the tickets by the specified event
            {
                $match: {
                    event: mongoose.Types.ObjectId(event_id),
                    type: "Free"
                }
            },
            //group the tickets by event and sum the free tickets sold
            //summing the free field
            {
                $group: {
                    _id: "$event",
                    freeTicketsSold: {
                        $sum: "$sold"
                    }
                }
            }
        ]);
        //the result of the aggregation is an array of objects
        //the first object is the one we want
        ///the freeTicketsSold field is the one we want
        return result.length > 0 ? result[0].freeTicketsSold : 0;
    }
    catch(err){
        return err.message;
    }
};

//create an aggregate function to get the number of paid tickets sold for an event
//will get the event id and return the number of paid tickets sold
const getPaidTicketsSold = async (event_id) => {
    try{
        const result=await Ticket.aggregate([
            //match the event id filters the tickets by the specified event
            {
                $match: {
                    event: mongoose.Types.ObjectId(event_id),
                    type: "Paid"
                }
            },
            //group the tickets by event and sum the paid tickets sold
            //summing the paid field
            {
                $group: {
                    _id: "$event",
                    paidTicketsSold: {
                        $sum: "$sold"
                    }
                }
            }
        ]);
        //the result of the aggregation is an array of objects
        //the first object is the one we want
        ///the paidTicketsSold field is the one we want
        return result.length > 0 ? result[0].paidTicketsSold : 0;
    }
    catch(err){
        return err.message;
    }
};

// create an aggregate function to sum the number of ticket types sold for an event
// it should loop through the orders of an event and sum the lengths of the ticketsBought array for each order
//return the sum of the lengths of the ticketsBought arrays
const getSumofTicketsBoughtArray = async (eventId) => {
    const sumofTicketsBoughtArray = await Order.aggregate([
        {
            $match:
            {
                event: mongoose.Types.ObjectId(eventId),
            }
        },
        {
            $group: {
                _id: "$event",
                sumofTicketsBoughtArray: {
                    $sum: { $size: "$ticketsBought" }
                }
            }
        }
    ]);
    return sumofTicketsBoughtArray.length > 0 ? sumofTicketsBoughtArray[0].sumofTicketsBoughtArray : 0;
};







module.exports = {getTicketsSold, getOrdersCount, getTotalCapacity, getTotalMoneyEarned, getTotalTicketsInOrder, getTotalTicketCapacity, getFreeTicketsSold, getPaidTicketsSold, getSumofTicketsBoughtArray};
