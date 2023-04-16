const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const Event = require('../models/Events');
const Category = require('../models/Category');
const Venue = require('../models/Venue');

jest.setTimeout(30000000);
require("dotenv").config();


beforeAll(async () => {
    const url = "mongodb+srv://Eventbrite-backend:envie_backend_2023@eventbrite-cluster.krn9ebx.mongodb.net/TestDB?retryWrites=true&w=majority";
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await Event.deleteMany({});
    await Category.deleteMany({});
});

beforeEach(async () => {
    await Event.deleteMany({});
    await Category.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

function testFormat(res, statusCode, message){
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(message);
    expect(res.statusCode).toEqual(statusCode);
}

async function createCategory(){
    const randomName = Math.random().toString(36).substring(7);
    const res = await request(app).post("/api/categories").send({
        "name": randomName,
    });
    console.log(res.body.category._id);
    return res.body.category._id;
}

describe("Events", () => {
    describe("GET /events", () => {
        it("should return 200 OK",async () => {
            const res = await request(app).get("/api/events");
            expect(res.statusCode).toEqual(200);

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
            assert.equal(res.data.message, "Number of tickets bought is not in range!");
        });
    });

    describe("POST /events", () => {
        it("should return 200 OK",async () => {
            const categoryID = await createCategory();

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
            assert.equal(res.statusCode, 500);
            assert.equal(res.data.message, "Promocode not available!");
        });

        it("should return 400 Bad Request due to missing name field",async () => {
            const categoryID = await createCategory();
            const res = await request(app).post("/api/events").send({
                "capacity": 1000,
                "description": "Aly eventAly eventAly eventAly eventAly eventAly event",
                "category": categoryID
            });
            testFormat(res, 400, "name field is required");
        });




    });

    // Test nearest events
    describe("GET /events/nearest", () => {
        it("should return 200 OK",async () => {
            const res = await request(app).get("/api/events/nearest?lat=30.4288393&lng=31.2912463");
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('city');
            expect(res.body.city).toEqual('Qalyubia');
            expect(res.body).toHaveProperty('events');
        });
    });

});