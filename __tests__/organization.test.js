const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require('../models/User');
const Organization = require("../models/Organization");
const Organizer = require("../models/Organizer");
const Event = require('../models/Events');
const bcrypt = require("bcryptjs");

jest.setTimeout(1000000);


let userId;
let token;
let userId1;
let token1;
const objectId = mongoose.Types.ObjectId('569ed8269353e9f4c51617aa');

beforeAll(async() => {
    await mongoose.connect("mongodb+srv://Eventbrite-backend:envie_backend_2023@eventbrite-cluster.krn9ebx.mongodb.net/TestDB?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    
    await User.deleteMany({});
    bcrypt.genSalt(10)
    .then(salt => {
    return bcrypt.hash("Admin@123", salt)
    }).then(hash => {
    }).catch(err => console.error(err.message));

    let user = new User({
        firstName: "Mai",
        lastName: "Abdelhameed",
        emailAddress:"maiabdelhameed@gmail.com",
        password: await bcrypt.hash("ayhaga", 10),
        isVerified: true,
        isCreator: true
    });

    await user.save();
    const res = await request(app).post("/auth/login").send({
        "emailAddress": "maiabdelhameed@gmail.com",
        "password":"ayhaga"
    });
    userId = res.body.user._id;
    token = res.body.token;

    let user1 = new User({
        firstName: "Mai",
        lastName: "Abdelhameed",
        emailAddress:"maiabdelhameed16@gmail.com",
        password: await bcrypt.hash("ayhaga", 10),
        isVerified: true,
        isCreator: false
    });
    await user1.save();
    const res1 = await request(app).post("/auth/login").send({
        "emailAddress": "maiabdelhameed16@gmail.com",
        "password":"ayhaga"
    });
    userId1 = res1.body.user._id;
    token1 = res1.body.token;
});



function testFormat(res, statusCode, message){
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(message);
    expect(res.statusCode).toEqual(statusCode);
}


//close the connection to the database
afterAll(async () => {
    await mongoose.connection.close();
});



describe('Creating organization', () => {
    describe('Case 1: Organization created successfully.', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).post('/organization/create/'+ userId).send({
                "name": "test organization"
            }).set('Authorization', 'Bearer' + token);
            console.log(token);
            console.log(userId);
            console.log(res.body);
            testFormat(res, 200, "Organization created successfully");
            expect(res.body).toHaveProperty('organization');
        });
    });

    // describe('Case 2: Name field missing', () => {
    //     it('it should return 400 Error', async() => {
    //         const res = await request(app).post('/organization/create/' + userId).set('Authorization', 'Bearer' + token);
    //         testFormat(res,400,"Organization name is required.");
    //     });
    // });

    // describe('Case 3: User not found', () => {
    //     it('it should return 400 Error', async() => {
    //         const res = await request(app).post('/organization/create' + objectId).send({
    //             "name": "test organization"
    //         }).set('Authorization', 'Bearer' + token);
    //         testFormat(res, 400, 'User not found');
    //     });
    // });

    // describe('Case 4: Invalid Token', () => {
    //     it('it should return 400 Error', async() => {
    //         const res = await request(app).post('/organization/create' + objectId).send({
    //             "name": "test organization"
    //         });
    //         testFormat(res, 400, 'No token provided!');
    //     });
    // });

    // describe('Case 5: User not authorized', () => {
    //     it('it should return 400 Error', async() => {
    //         const res = await request(app).post('/organization/create' + userId1).send({
    //             "name": "test organization"
    //         }).set('Authorization', 'Bearer' + token);
    //         testFormat(res, 400, "You have to be a creator to create organization.");
    //     });
    // });

});

