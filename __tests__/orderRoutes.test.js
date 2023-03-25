//test 
const supertest = require('supertest');
const assert = require('assert');



//mongoose
const mongoose = require('mongoose');

//requiring the needed function
const {createOrder}=require('../controllers/orderController');
const {generateQRCodeAndSendEmail}=require('../controllers/qrCodeController');

//requiring the needed models
const Order = require('../models/Order');
const TicketClass = require('../models/Tickets');
const Event = require('../models/Events');
const Promocode = require('../models/Promocode');
const User = require('../models/User');

//set timeout to 10 seconds
jest.setTimeout(1000000);
//some variables
let eventId="";
let ticketClass1Id="";
let ticketClass2Id="";
let ticketClass3Id="";
let ticketClass4Id="";
let promocode1Id="";
let promocode2Id="";
let promocode3Id="";
let userId="";
//connect to the database
beforeAll(async () => {
    await mongoose.connect("mongodb+srv://Eventbrite-backend:envie_backend_2023@eventbrite-cluster.krn9ebx.mongodb.net/TestDB?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    //clear the database
    await Order.deleteMany({});
    await TicketClass.deleteMany({});
    await Event.deleteMany({});
    await Promocode.deleteMany({});
    await User.deleteMany({});

    //create a new user
    const user = new User({
        firstName: "Ola",
        lastName: "Abouelhadid",
        emailAddress:"abouelhadid.ola@gmail.com",
        isVerified: true,
        isCreator: true
    });
    await user.save();
    userId=user._id;

    //create a new event
    const event = new Event({
        name: "Test Event",
        description: "Test Event Description",
        date: "2020-07-20T00:00:00.000Z",
        summary: "Test Event Summary",
        capacity: 100,
        category: "5f0c0b8a93b8f63b68d0b1f8",
    });
    await event.save();
    eventId=event._id;

    //create a new ticket class
    //capacity is 100
    //started 21/3
    //will end 31/3
    const ticketClass1 = new TicketClass({
        event: event._id,
        name: "Test Ticket Class 1",
        type: "paid",
        price: 10,
        fee: 1,
        capacity: 100,
        minQuantityPerOrder: 1,
        maxQuantityPerOrder: 10,
        salesStart: "2023-03-21T00:00:00.000Z",
        salesEnd: "2023-03-31T00:00:00.000Z"
    });
    await ticketClass1.save();
    ticketClass1Id=ticketClass1._id;

    //create a new ticket class
    //capacity is 0
    const ticketClass2 = new TicketClass({
        event: event._id,
        name: "Test Ticket Class 2",
        type: "paid",
        price: 20,
        fee: 2,
        capacity: 0,
        minQuantityPerOrder: 1,
        maxQuantityPerOrder: 5,
        salesStart: "2023-03-21T00:00:00.000Z",
        salesEnd: "2023-03-31T00:00:00.000Z"
    });
    await ticketClass2.save();
    ticketClass2Id=ticketClass2._id;


    //create a new ticket class
    //capacity is 100
    //will start 1/4
    //will end 10/4
    const ticketClass3 = new TicketClass({
        event: event._id,
        name: "Test Ticket Class 3",
        type: "paid",
        price: 30,
        fee: 3,
        capacity: 100,
        minQuantityPerOrder: 1,
        maxQuantityPerOrder: 5,
        salesStart: "2023-04-01T00:00:00.000Z",
        salesEnd: "2023-04-10T00:00:00.000Z"
    });
    await ticketClass3.save();
    ticketClass3Id=ticketClass3._id;

    //create a new ticket class
    //free ticket
    const ticketClass4 = new TicketClass({
        event: event._id,
        name: "Test Ticket Class 4",
        type: "free",
        price: 0,
        fee: 0,
        capacity: 100,
        minQuantityPerOrder: 1,
        maxQuantityPerOrder: 5,
        salesStart: "2023-03-21T00:00:00.000Z",
        salesEnd: "2023-03-31T00:00:00.000Z"
    });
    await ticketClass4.save();
    ticketClass4Id=ticketClass4._id;

    //add the ticket classes to the event
    event.tickets.push(ticketClass1._id);
    event.tickets.push(ticketClass2._id);
    event.tickets.push(ticketClass3._id);
    event.tickets.push(ticketClass4._id);
    await event.save();

    //create a new promocode
    //normal promocode 
    //used is less than limit
    //Started 21/3
    //will end 31/3
    const promocode1 = new Promocode({
        event: event._id,
        name: "Test Promocode 1",
        percentOff: 10,
        limit: 10,
        used: 0,
        startDate: "2023-03-21T00:00:00.000Z",
        endDate: "2023-03-31T00:00:00.000Z"
    });
    //add ticket class 1 to the promocode ticket array
    promocode1.tickets.push(ticketClass1._id);
    await promocode1.save();
    promocode1Id=promocode1._id;

    //create a new promocode
    //unavailable promocode
    //used equals limit
    //Started 21/3
    //will end 31/3
    const promocode2 = new Promocode({
        event: event._id,
        name: "Test Promocode 2",
        percentOff: 10,
        limit: 10,
        used: 10,
        startDate: "2023-03-21T00:00:00.000Z",
        endDate: "2023-03-31T00:00:00.000Z"
    });
    //add ticket class 1 to the promocode ticket array
    promocode2.tickets.push(ticketClass1._id);
    await promocode2.save();
    promocode2Id=promocode2._id;


    //create a new promocode
    //unavailable promocode
    //will start 1/4
    //will end 10/4
    const promocode3 = new Promocode({
        event: event._id,
        name: "Test Promocode 3",
        percentOff: 10,
        limit: 10,
        used: 0,
        startDate: "2023-04-01T00:00:00.000Z",
        endDate: "2023-04-10T00:00:00.000Z"
    });
    //add ticket class 1 to the promocode ticket array
    promocode3.tickets.push(ticketClass1._id);
    await promocode3.save();
    promocode3Id=promocode3._id;

});

// //dummy test to check if the test is working
// describe('Dummy test', () => {
//     it('should return 1', () => {
//         expect(1).toBe(1);
//     });
// });

//Testing the place order function WITHOUT the QR code part
//comment the generateQRCode function in the createOrder function for the test to pass
describe('Place order', () => {

    describe('Case 1: Normal Case, tickets are available and the promocode is available', () => {
        it('should return 201', async () => {
            const event = eventId;
            const user_id = userId;
            const ticketsBought = [
                {
                    "ticketClass": ticketClass1Id,
                    "number": 4
                }
            ];
            const promocode = promocode1Id;
            const req = {
                params: {
                    event_id: event
                },
                user: {
                    _id: user_id
                },
                body: {
                    ticketsBought: ticketsBought,
                    promocode: promocode
                }
            };
            const res = {
                status: function (status) {
                    this.statusCode = status;
                    return this;
                },
                json: function (data) {
                    this.data = data;
                }
            };
            await createOrder(req, res);
            assert.equal(res.statusCode, 201);
            assert.equal(res.data.message, "Order created successfully!");
        });

    });
    describe('Case 2: Normal Case, tickets are available and no promocode applied', () => {
        it('should return 201', async () => {
            const event = eventId;
            const user_id = userId;
            const ticketsBought = [
                {
                    "ticketClass": ticketClass1Id,
                    "number": 4
                }
            ];
            const req = {
                params: {
                    event_id: event
                },
                user: {
                    _id: user_id
                },
                body: {
                    ticketsBought: ticketsBought
                }
            };
            const res = {
                status: function (status) {
                    this.statusCode = status;
                    return this;
                },
                json: function (data) {
                    this.data = data;
                }
            };
            await createOrder(req, res);
            assert.equal(res.statusCode, 201);
            assert.equal(res.data.message, "Order created successfully!");
        });

    });
    describe('Case 3: Failed Case, the number of bought tickets is more than the ticket capacity', () => {
        it('should return 500', async () => {
            const event = eventId;
            const user_id = userId;
            const ticketsBought = [
                {
                    "ticketClass": ticketClass2Id,
                    "number": 1
                }
            ];

            const req = {
                params: {
                    event_id: event
                },
                user: {
                    _id: user_id
                },
                body: {
                    ticketsBought: ticketsBought
                }
            };
            const res = {
                status: function (status) {
                    this.statusCode = status;
                    return this;
                },
                json: function (data) {
                    this.data = data;
                }
            };
            await createOrder(req, res);
            assert.equal(res.statusCode, 500);
            assert.equal(res.data.message, "Ticket Class not available!");
        });

        describe("Case 4: Failed Case, the ticket didn't start selling yet", () => {
            it('should return 500', async () => {
                const event = eventId;
                const user_id = userId;
                const ticketsBought = [
                    {
                        "ticketClass": ticketClass3Id,
                        "number": 4
                    }
                ];

                const req = {
                    params: {
                        event_id: event
                    },
                    user: {
                        _id: user_id
                    },
                    body: {
                        ticketsBought: ticketsBought
                    }
                };
                const res = {
                    status: function (status) {
                        this.statusCode = status;
                        return this;
                    },
                    json: function (data) {
                        this.data = data;
                    }
                };
                await createOrder(req, res);
                assert.equal(res.statusCode, 500);
                assert.equal(res.data.message, "Ticket Class not available!");
            });

        });



    });
});

//close the connection to the database
afterAll(async () => {
    await mongoose.connection.close();
});



