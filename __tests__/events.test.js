const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const Event = require('../models/Events');
const Category = require('../models/Category');
const Venue = require('../models/Venue');

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

        });
    });
    
    describe("GET /events/:id", () => {
        it("should return 200 OK",async () => {
            const categoryID = await createCategory();
            const event = await request(app).post("/api/events").send({
                "name": "Aly event",
                "capacity": 1000,
                "description": "Aly eventAly eventAly eventAly eventAly eventAly event",
                "summary": "Aly eventAly eventAly eventAly eventAly eventAly event",
                "date":"2015-05-02",
                "organizer": "178c938efc5c9b18a400de22",
                "category": categoryID,
                "location": "178c938efc5c9b18a400de22",
                "image":"htyppat",
                "hostedBy":"178c938efc5c9b18a400de22"
            });
            console.log(event.body);
            const res = await request(app).get("/api/events/" + event.body.event._id);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('name');
            expect(res.body.name).toEqual('Aly event');
        });
    });

    describe("POST /events", () => {
        it("should return 200 OK",async () => {
            const categoryID = await createCategory();

            const res = await request(app).post("/api/events").send({
                "name": "Aly event",
                "capacity": 1000,
                "description": "Aly eventAly eventAly eventAly eventAly eventAly event",
                "summary": "Aly eventAly eventAly eventAly eventAly eventAly event",
                "date":"2015-05-02",
                "organizer": "178c938efc5c9b18a400de22",
                "category": categoryID,
                "location": "178c938efc5c9b18a400de22",
                "image":"htyppat",
                "hostedBy":"178c938efc5c9b18a400de22"
            });
            testFormat(res, 200, "Event created successfully");
            expect(res.body).toHaveProperty('event');
            expect(res.body.event).toHaveProperty('name');
            expect(res.body.event.name).toEqual('Aly event');
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