//require all models
const User = require('../models/userModel');
const Event = require('../models/Events');
const Ticket = require('../models/Tickets');
const Order = require('../models/Order');
const Promocode = require('../models/Promocode');

//require create ticket in the ticket controller
const {createTicket} = require('../controllers/ticketController');

//require app
const app = require('../app');

//require faker
const faker = require('faker');
//require mongoose
const mongoose = require('mongoose');


//function to loop through the events in the db 
//create random tickets for each event using faker
//save the tickets in the db
const populateTickets = async () => {
    const startDate = new Date('2023-01-01T00:00:00.000Z');
    const endDate = new Date('2023-12-31T23:59:59.999Z');
    //all events
    const events = await Event.find({});
    //loop through the events
    for (let i = 0; i < events.length; i++) {
        //create a random number of tickets for each event
        let numberOfTickets = Math.floor(Math.random() * 10) + 1;
        //loop through the number of tickets
        for (let j = 0; j < numberOfTickets; j++) {
            //create a random ticket 
            let ticket = new Ticket({
                event: events[i]._id,
                name: faker.commerce.productName(),
                type: faker.random.arrayElement(['Free', 'Paid']),
                price: faker.commerce.price({
                    'min': 0,
                    'max': 100
                }),
                fee:ticket.price * 0.037 + 1.79 + ticket.price * 0.029,
                capacity: faker.random.number({
                    'min': 10,
                    'max': events[i].capacity
                }),
                sold:0,
                minQuantityPerOrder: faker.random.number({
                    'min': 1,
                    'max': 3
                }),
                maxQuantityPerOrder: faker.random.number({
                    'min': 10,
                    'max': 20
                }),
                salesStart: faker.date.between(startDate, endDate).toISOString(),
                salesEnd: faker.date.between(startDate, endDate).toISOString(),
                description: faker.lorem.paragraph()
            });
            //save the ticket in the db
            await ticket.save();
            }
        }     
    };

