//test 
const supertest = require('supertest');
const assert = require('assert');
//require fs
const fs = require('fs');
//require path
const path = require('path');
const {promisify} = require('util');



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
const { exist } = require('joi');

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
        emailAddress:"EnvieTrial@gmail.com",
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
        postalCode:"1111",
        country: "Egypt",
        address1:"Test Address 1",
        city:"Cairo",
        venueName:"Test Venue Name",
        startDate: "2020-04-10T00:00:00.000Z",
        endDate: "2020-04-20T00:00:00.000Z"
    });
    await event.save();
    eventId=event._id;

    //create a new ticket class
    const ticketClass1 = new TicketClass({
        event: event._id,
        name: "Test Ticket Class 1",
        type: "paid",
        price: 10,
        fee: 1,
        capacity: 100,
        sold: 0,
        minQuantityPerOrder: 2,
        maxQuantityPerOrder: 10,
        salesStart: "2022-03-21T00:00:00.000Z",
        salesEnd: "2024-03-31T00:00:00.000Z"
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
        capacity: 100,
        sold: 100,
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
        salesStart: "2024-04-01T00:00:00.000Z",
        salesEnd: "2025-04-10T00:00:00.000Z"
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
        salesStart: "2022-03-21T00:00:00.000Z",
        salesEnd: "2024-03-31T00:00:00.000Z"
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
    const promocode1 = new Promocode({
        event: event._id,
        name: "Test Promocode 1",
        percentOff: 10,
        limit: 10,
        used: 0,
        startDate: "2022-03-21T00:00:00.000Z",
        endDate: "2024-03-31T00:00:00.000Z"
    });
    //add ticket class 1 to the promocode ticket array
    promocode1.tickets.push(ticketClass1._id);
    await promocode1.save();
    promocode1Id=promocode1._id;

    //create a new promocode
    //unavailable promocode
    //used equals limit
    const promocode2 = new Promocode({
        event: event._id,
        name: "Test Promocode 2",
        percentOff: 10,
        limit: 10,
        used: 10,
        startDate: "2022-03-21T00:00:00.000Z",
        endDate: "2024-03-31T00:00:00.000Z"
    });
    //add ticket class 1 to the promocode ticket array
    promocode2.tickets.push(ticketClass1._id);
    await promocode2.save();
    promocode2Id=promocode2._id;


    //create a new promocode
    //unavailable promocode
    const promocode3 = new Promocode({
        event: event._id,
        name: "Test Promocode 3",
        percentOff: 10,
        limit: 10,
        used: 0,
        startDate: "2024-04-01T00:00:00.000Z",
        endDate: "2025-04-10T00:00:00.000Z"
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

// //trial to mock the send email function so that it will not be included in the test
// //this will allow the testing of the place order without the sending email part
jest.mock('../utils/emailVerification', () => ({
    sendMailWithAttachment: jest.fn().mockResolvedValue()
}));

//also mock the generateQRCodeAndSendEmail function in the order controller so that it will not be included in the test
//this will allow the testing of the place order without the QR code part,
//but the create order function will still be tested
jest.mock('../controllers/qrCodeController', () => ({
    generateQRCodeAndSendEmail: jest.fn().mockResolvedValue(),
    // createOrder: jest.requireActual('../controllers/orderController').createOrder

}));


//Testing the place order function WITHOUT the QR code part
//comment the generateQRCode function in the createOrder function for the test to pass
describe('Place order', () => {
    const firstName="Ola";
    const lastName="Abouelhadid";
    const email="abouelhadid.ola@gmail.com"

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
                    promocode: promocode,
                    firstName: firstName,
                    lastName: lastName,
                    email: email

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
            //call the send email function
            // expect(sendMailWithAttachment).toHaveBeenCalled();
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
                    ticketsBought: ticketsBought,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
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
                    ticketsBought: ticketsBought,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
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
                    ticketsBought: ticketsBought,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
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

    describe("Case 5: Failed Case, bought tickets is less than the minimum per order", () => {
        it('should return 500', async () => {
            const event = eventId;
            const user_id = userId;
            const ticketsBought = [
                {
                    "ticketClass": ticketClass1Id,
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
                    ticketsBought: ticketsBought,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
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
            assert.equal(res.data.message, "Number of tickets bought is not in range!");
        });
    });

    describe("Case 6: Failed Case, bought tickets is more than the maximum per order", () => {
        it('should return 500', async () => {
            const event = eventId;
            const user_id = userId;
            const ticketsBought = [
                {
                    "ticketClass": ticketClass1Id,
                    "number": 11
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
                    ticketsBought: ticketsBought,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
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
            assert.equal(res.data.message, "Number of tickets bought is not in range!");
        });
    });

    describe("Case 7: Failed Case, the promocode is not available, used to its limit", () => {
        it('should return 500', async () => {
            const event = eventId;
            const user_id = userId;
            const ticketsBought = [
                {
                    "ticketClass": ticketClass1Id,
                    "number": 4
                }
            ];
            const promocode = promocode2Id;
            const req = {
                params: {
                    event_id: event
                },
                user: {
                    _id: user_id
                },
                body: {
                    ticketsBought: ticketsBought,
                    promocode: promocode,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
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
            assert.equal(res.data.message, "Promocode not available!");
        });
    });

    describe("Case 8: Failed Case, the promocode is not available, since its start date hasn't arrived yet", () => {
        it('should return 500', async () => {
            const event = eventId;
            const user_id = userId;
            const ticketsBought = [
                {
                    "ticketClass": ticketClass1Id,
                    "number": 4
                }
            ];
            const promocode = promocode3Id;
            const req = {
                params: {
                    event_id: event
                },
                user: {
                    _id: user_id
                },
                body: {
                    ticketsBought: ticketsBought,
                    promocode: promocode,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
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
            assert.equal(res.data.message, "Promocode not available!");
        });
    });

    describe("Case 9: Normal Case: Buying a free ticket only", () => {
        it('should return 201', async () => {
            const event = eventId;
            const user_id = userId;
            const ticketsBought = [
                {
                    "ticketClass": ticketClass4Id,
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
                    ticketsBought: ticketsBought,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
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


});

//close the connection to the database
afterAll(async () => {
    const timeoutId=setTimeout(async () => {
    await mongoose.connection.close();

    //no need to do that, since the qr code and send mail function is disabled


    // //delete the files in the public folder whose names contain the string "QrCode"
    // const files = fs.readdirSync(path.join(__dirname, "../public"));
    // files.forEach(async file => {
    //     if (file.includes("QrCode")) {
    //         if(fs.existsSync(path.join(__dirname, "../public", file)))
    //         {
    //             const unlink=promisify(fs.unlink);
    //             await Promise.all([unlink(path.join(__dirname, "../public", file))]);
    //         }
    //     }
    // });
    // //delete the email-template-final.html file in the views folder
    // if (fs.existsSync(path.join(__dirname, "../views", "email-template-final.html"))){
    //     const unlink=promisify(fs.unlink);
    //     await Promise.all([unlink(path.join(__dirname, "../views", "email-template-final.html"))]);
    // }
    
    }, 1000);
    clearTimeout(timeoutId);
    
});


