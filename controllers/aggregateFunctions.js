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
        return result[0].ticketsSold;
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

        return result[0].ordersCount;
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
        return result[0].ticketsCount;
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
        return result[0].totalMoneyEarned;
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
        return result[0].totalTickets;
    }
    catch(err){
        return err.message;
    }     
};


module.exports = {getTicketsSold, getOrdersCount, getTotalCapacity, getTotalMoneyEarned, getTotalTicketsInOrder};
