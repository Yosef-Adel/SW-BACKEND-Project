const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

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

jest.setTimeout(30000000);
require("dotenv").config();

const bcrypt = require("bcryptjs");

let token="";
let userId;
let eventId;
let ticketId;

beforeAll(async () => {
    const url = "mongodb+srv://Eventbrite-backend:envie_backend_2023@eventbrite-cluster.krn9ebx.mongodb.net/TestDB?retryWrites=true&w=majority";
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await Event.deleteMany({});
    await Promocode.deleteMany({});
    await Order.deleteMany({});
    await Ticket.deleteMany({});
    await User.deleteMany({});

    bcrypt.genSalt(10)
    .then(salt => {
    return bcrypt.hash("Admin@123", salt)
    }).then(hash => {
    }).catch(err => console.error(err.message));

    //create a user and save it
    const user = new User({
        firstName: "Ola",
        lastName: "Abouelhadid",
        emailAddress:"abouelhadid.ola@gmail.com",
        password: await bcrypt.hash("123456", 10),
        isVerified: true,
        isCreator: true
    });
    await user.save();
    userId = user._id;
    //login the user
    const res = await request(app).post("/auth/login").send({
            "emailAddress": "abouelhadid.ola@gmail.com",
            "password": "123456"
    });
    token = res.body.token; 
    // console.log(token);

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
            startDate: "2023-04-10T00:00:00.000Z",
            endDate: "2024-04-20T00:00:00.000Z",
            createdBy: userId,
            hostedBy: userId
        });
        await event.save();
        eventId=event._id;

});

describe("Create a ticket class", () => {
    it("should return 201 OK",async () => {
                //create a ticket class
                const ticket={
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
                };
        const res2=await request(app).post("/ticket/"+ eventId +"/createTicket").send(ticket).set("Authorization", "Bearer " + token);
        ticketId= await Ticket.findOne({name: "Test Ticket Class 1"})._id;
        expect(res2.status).toEqual(201);
        expect(res2.body).toHaveProperty("message");
        expect(res2.body.message).toEqual("Ticket created successfully!");

    });

});

describe("Create a promocode", () => {
    it("should return 201 OK, valid promocode",async () => {
        const tdate = new Date("2022-04-26" + " 3:45 PM");
        startdate = tdate.toISOString();

        //valid promocode
        const promocode={
            "name":"Test Promo 1",
            "tickets": [
                ticketId,
            ],
            "percentOff": 20,
            "limit": 80,
            "startDate": startdate,
            "endDate": "2024-03-31T00:00:00.000Z"
        }
        const res=await request(app).post("/promocode/"+eventId).send(promocode).set("Authorization", "Bearer " + token);
        expect(res.status).toEqual(201);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toEqual("Promocode created successfully!");

    });
});

describe("Create a promocode", () => {
    it("should return 400 Bad Request, invalid promocode, not all fields are given",async () => {
        const promocode={
            "tickets": [
                ticketId,
            ],
            "percentOff": 20,
            "limit": 80,
            "startDate": "2023-03-21T00:00:00.000Z",
            "endDate": "2024-03-31T00:00:00.000Z"
        }
        const res=await request(app).post("/promocode/"+eventId).send(promocode).set("Authorization", "Bearer " + token);
        expect(res.status).toEqual(400);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toEqual("All fields are required.");
    });
});

describe("Create a promocode", () => {
    it("should return 400 Bad Request, invalid promocode, percent off or amount off is needed",async () => {
        const promocode={
            "name":"Test Promo 2",
            "tickets": [
                ticketId,
            ],
            "limit": 80,
            "startDate": "2023-03-21T00:00:00.000Z",
            "endDate": "2024-03-31T00:00:00.000Z"
        }
        const res=await request(app).post("/promocode/"+eventId).send(promocode).set("Authorization", "Bearer " + token);
        expect(res.status).toEqual(400);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toEqual("Amount off or percent off is required.");

    });
});

//test check promo function by name
describe("Check promo", () => {
    it("should return 200 OK, valid promocode",async () => {
        const res=await request(app).get("/promocode/"+ eventId+"/Test Promo 1/checkPromo");
        expect(res.status).toEqual(200);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toEqual("Promocode is valid.");
    });
});

//test check promo function by name
describe("Check promo", () => {
    it("should return 400 Bad Request, invalid promocode, doesn't exist",async () => {
        const res=await request(app).get("/promocode/"+ eventId+"/Ay esm/checkPromo");
        expect(res.status).toEqual(400);
        expect(res.body).toHaveProperty("message");
        expect(res.body.message).toEqual("INVALID! Promocode does not exist.");
    });
});

//test check promo function by name
describe("Check promo", () => {
    it("should return 400 Bad Request, invalid promocode, expired",async () => {
        //create an expired promocode
        const promocode={
            "name":"Test Promo 2",
            "tickets": [
                ticketId,
            ],
            "percentOff": 20,
            "limit": 80,
            "startDate": "2020-03-21T00:00:00.000Z",
            "endDate": "2020-03-31T00:00:00.000Z"
        }
        const res1=await request(app).post("/promocode/"+eventId).send(promocode).set("Authorization", "Bearer " + token);
        expect(res1.status).toEqual(201);
        expect(res1.body).toHaveProperty("message");
        expect(res1.body.message).toEqual("Promocode created successfully!");
        const res2=await request(app).get("/promocode/"+ eventId+"/Test Promo 2/checkPromo");
        expect(res2.status).toEqual(400);
        expect(res2.body).toHaveProperty("message");
        expect(res2.body.message).toEqual("INVALID! Promocode is expired.");
    });
});


afterAll(async () => {
    await mongoose.connection.close();
});