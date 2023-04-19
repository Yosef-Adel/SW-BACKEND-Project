const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const Event = require('../models/Events');
const Category = require('../models/Category');
const Venue = require('../models/Venue');
const User = require("../models/User");
const bcrypt = require("bcryptjs");

jest.setTimeout(30000000);
require("dotenv").config();


beforeAll(async () => {
    const url = "mongodb+srv://Eventbrite-backend:envie_backend_2023@eventbrite-cluster.krn9ebx.mongodb.net/TestDB?retryWrites=true&w=majority";
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await Event.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    bcrypt.genSalt(10)
    .then(salt => {
    return bcrypt.hash("Admin@123", salt)
    }).then(hash => {
    }).catch(err => console.error(err.message));
});

beforeEach(async () => {
    await Event.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

function testFormat(res, statusCode, message){
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(message);
    expect(res.statusCode).toEqual(statusCode);
}

async function getToken(){
    const randomName = Math.random().toString(36).substring(7);

    let user = new User({
        firstName: "Aly",
        lastName: "Khaled",
        emailAddress:`${randomName}@aly.com`,
        password: await bcrypt.hash("hash", 10),
        isVerified: true,
        isCreator: true
    });

    await user.save();
    const res = await request(app).post("/auth/login").send({
        "emailAddress": `${randomName}@aly.com`,
        "password":"hash"
    });
    return res.body.token;
}

async function createCategory(){
    const randomName = Math.random().toString(36).substring(7);
    const res = await request(app).post("/api/categories").send({
        "name": randomName,
    });
    return {
        categoryID: res.body.category._id,
        categoryName: randomName
    };
}

describe("Events", () => {
    describe("GET /events", () => {
        it("should return 200 OK",async () => {
            const res = await request(app).get("/api/events");
            expect(res.statusCode).toEqual(200);

        });
    });
    
    describe("GET /events/:id", () => {
        beforeEach(async () => {
            await Event.deleteMany({});
            await Category.deleteMany({});
            await User.deleteMany({});
        });

        it("should return 200 OK",async () => {
            const {categoryID} = await createCategory();
            const token = await getToken();
            console.log(token);
            const event = await request(app).post("/api/events").send({
                "name": "Aly event",
                "capacity": 1000,
                "description": "Aly eventAly eventAly eventAly eventAly eventAly event",
                "summary": "Aly eventAly eventAly eventAly eventAly eventAly event",
                "date":"2015-05-02",
                "organizer": "178c938efc5c9b18a400de22",
                "category": categoryID,
                "venueName": "Aly venue",
                "city": "Aly venue",
                "address1": "Aly venue",
                "country": "Aly venue",
                "isOnline": "true",
                "image":"htyppat",
                "hostedBy":"178c938efc5c9b18a400de22",
                "startDate":"2023-04-18T19:00",
                "endDate":"2023-04-18T19:00",
            }).set('Authorization', 'Bearer ' + token);
            const res = await request(app).get("/api/events/" + event.body.event._id);
            expect(res.statusCode).toEqual(200);
            console.log(res.body);
            expect(res.body).toHaveProperty('name');
            expect(res.body.name).toEqual('Aly event');
        });
    });

    // describe("POST /events", () => {
    //     beforeEach(async () => {
    //         await Event.deleteMany({});
    //         await Category.deleteMany({});
    //         await User.deleteMany({});
    //     });
    //     it("should return 200 OK",async () => {
    //         const {categoryID} = await createCategory();
    //         const token = await getToken();
    //         const res = await request(app).post("/api/events").send({
    //             "name": "Aly event",
    //             "capacity": 1000,
    //             "description": "Aly eventAly eventAly eventAly eventAly eventAly event",
    //             "summary": "Aly eventAly eventAly eventAly eventAly eventAly event",
    //             "date":"2015-05-02",
    //             "organizer": "178c938efc5c9b18a400de22",
    //             "category": categoryID,
    //             "venueName": "Aly venue",
    //             "city": "Aly venue",
    //             "address1": "Aly venue",
    //             "country": "Aly venue",
    //             "isOnline": "true",
    //             "image":"htyppat",
    //             "hostedBy":"178c938efc5c9b18a400de22",
    //             "startDate":"2023-04-18T19:00",
    //             "endDate":"2023-04-18T19:00",
    //         }).set('Authorization', 'Bearer ' + token);
    //         testFormat(res, 200, "Event created successfully");
    //         expect(res.body).toHaveProperty('event');
    //         expect(res.body.event).toHaveProperty('name');
    //         expect(res.body.event.name).toEqual('Aly event');
    //     });

    //     it("should return 400 Bad Request due to missing name field",async () => {
    //         const {categoryID} = await createCategory();
    //         const token = await getToken();
    //         const res = await request(app).post("/api/events").send({
    //             "capacity": 1000,
    //             "description": "Aly eventAly eventAly eventAly eventAly eventAly event",
    //             "category": categoryID
    //         }).set('Authorization', 'Bearer ' + token);
    //         testFormat(res, 400, "name field is required");
    //     });

    // });

    // describe("GET /events/nearest", () => {
    //     it("should return 200 OK",async () => {
    //         const res = await request(app).get("/api/events/nearest?lat=30.4288393&lng=31.2912463");
    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toHaveProperty('city');
    //         expect(res.body.city).toEqual('Qalyubia');
    //         expect(res.body).toHaveProperty('events');
    //     });
    // });

    // describe("GET /events/ filter location", () => {
    //     it("should return 200 OK",async () => {
    //         const {categoryID} = await createCategory();
    //         const token = await getToken();
    //         const events = await request(app).post("/api/events").send({
    //             "name": "Aly event",
    //             "capacity": 1000,
    //             "description": "Aly eventAly eventAly eventAly eventAly eventAly event",
    //             "summary": "Aly eventAly eventAly eventAly eventAly eventAly event",
    //             "date":"2015-05-02",
    //             "organizer": "178c938efc5c9b18a400de22",
    //             "category": categoryID,
    //             "venueName": "Aly venue",
    //             "city": "Giza",
    //             "address1": "Aly venue",
    //             "country": "Aly venue",
    //             "isOnline": "true",
    //             "image":"htyppat",
    //             "hostedBy":"178c938efc5c9b18a400de22",
    //             "startDate":"2023-04-18T19:00",
    //             "endDate":"2023-04-18T19:00",
    //         }).set('Authorization', 'Bearer ' + token);
    //         const res = await request(app).get("/api/events?lat=29.998481&lng=31.161729");
    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toHaveProperty('city');
    //         expect(res.body.city).toEqual('Giza');
    //         expect(res.body).toHaveProperty('events');
    //     });
    // });

    // describe("GET /events/ filter category", () => {
    //     it("should return 200 OK",async () => {
    //         const {categoryID,categoryName} = await createCategory();
    //         const token = await getToken();
    //         const events = await request(app).post(`/api/events?category=${categoryName}`).send({
    //             "name": "Aly event",
    //             "capacity": 1000,
    //             "description": "Aly eventAly eventAly eventAly eventAly eventAly event",
    //             "summary": "Aly eventAly eventAly eventAly eventAly eventAly event",
    //             "date":"2015-05-02",
    //             "organizer": "178c938efc5c9b18a400de22",
    //             "category": categoryID,
    //             "venueName": "Aly venue",
    //             "city": "Giza",
    //             "address1": "Aly venue",
    //             "country": "Aly venue",
    //             "isOnline": "true",
    //             "image":"htyppat",
    //             "hostedBy":"178c938efc5c9b18a400de22",
    //             "startDate":"2023-04-18T19:00",
    //             "endDate":"2023-04-18T19:00",
    //         }).set('Authorization', 'Bearer ' + token);
    //         const res = await request(app).get("/api/events?lat=29.998481&lng=31.161729");
    //         expect(res.statusCode).toEqual(200);
    //         expect(res.body).toHaveProperty('city');
    //         expect(res.body).toHaveProperty('events');
    //         expect(res.body.events[0].category).toEqual(categoryID);
    //     });
    // });

});