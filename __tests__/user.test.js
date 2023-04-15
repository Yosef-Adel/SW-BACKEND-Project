const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require('../models/User');
const bcrypt = require("bcryptjs");

console.log("start testing")
jest.setTimeout(1000000);


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

    const user = new User({
        firstName: "Mai",
        lastName: "Abdelhameed",
        emailAddress:"maiabdelhameed@gmail.com",
        password: await bcrypt.hash("ayhagasah", 10),
        isVerified: true
    });
    await user.save();
});

function testFormat(res, statusCode, message){
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(message);
    expect(res.statusCode).toEqual(statusCode);
}




describe('Get Info', () => {
    describe('Case1: getting info successfully', () => {
        it('it should return 200 OK', async() => {
            const user = await User.findOne({emailAddress: 'abouelhadid.ola@gmail.com'});
            console.log(user);
            const res = await request(app).get(`/user/${user._id}`);
            testFormat(res, 200, "Success");
        });
    });

    describe('Case2: user not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get("/user/123456789");
            testFormat(res, 400, "User not found");
        });
    });
});

