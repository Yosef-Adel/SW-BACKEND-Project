const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require('../models/User');
const bcrypt = require("bcryptjs");

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
        firstName: "Ola",
        lastName: "Abouelhadid",
        emailAddress:"abouelhadid.ola@gmail.com",
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



describe('Sign up', () => {
    describe('Case1: signing up', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).post("/auth/sign-up").send({
                "firstName": "Mai",
                "lastName": "Abdelhameed",
                "emailAddress": "maiabdelhameed16@gmail.com",
                "password":"ayhaga"
            });
            testFormat(res, 200, "Check your email for verification.");
        });
    });

    describe('Case2: signing up with duplicate emails', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post("/auth/sign-up").send({
                "firstName": "Mai",
                "lastName": "Abdelhameed",
                "emailAddress": "maiabdelhameed16@gmail.com",
                "password":"ayhaga"
            });
            testFormat(res, 400, "Users validation failed: expected emailAddress to be unique.");
        });
    });
});


describe('Login', () => {
    describe('Case 1: logging in successfully', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).post("/auth/login").send({
                "emailAddress": "abouelhadid.ola@gmail.com",
                "password":"ayhagasah"
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.emailAddress).toEqual('abouelhadid.ola@gmail.com');
            expect(res.body).toHaveProperty('token');
        });
    });

    describe('Case 2: not verified', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post("/auth/login").send({
                "emailAddress": "maiabdelhameed16@gmail.com",
                "password":"ayhaga"
            });
            testFormat(res, 400, 'Please verify your email first.');
        });
    });

    describe('Case 3: wrong password', () => {
        it('it should return 400 Error', async() => {
            const user = await User.findOne({emailAddress: "abouelhadid.ola@gmail.com"});
            const res = await request(app).post("/auth/login").send({
                "emailAddress": "abouelhadid.ola@gmail.com",
                "password":"ayhagaghalat"
            });
            testFormat(res, 400, 'Password is incorrect');
        });
    });
});


describe('Forget Password', () => {
    describe('Case 1: forgot password for unverified user', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post("/auth/forgot-password").send({
                "emailAddress": "maiabdelhameed16@gmail.com",
            });
            testFormat(res, 400, "Please verify your email first.");
        });
    });

    describe('Case 2: forgot password with unregistered user', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post("/auth/forgot-password").send({
                "emailAddress": "maiabdelhameed@gmail.com"
            });
            testFormat(res, 400, "user not found");
        });
    });

    describe('Case 3: Forgot password successfully', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).post("/auth/forgot-password").send({
                "emailAddress": "abouelhadid.ola@gmail.com"
            });
            testFormat(res, 200, "Password token sent to email");
        });
    });
});

describe('Reset password', () => {
    describe('Case1: reset password successfully', () => {
        it('it should return 200 OK', async() => {
            const user = await User.findOne({emailAddress: "abouelhadid.ola@gmail.com"});
            const res = await request(app).patch(`/auth/reset-password/${user.forgotPasswordToken}`).send({
                "password":"ayhaga"
            });

            testFormat(res, 200, "password reset successfully");
        });
    });

    describe('Case2: missing password', () => {
        it('it should return 400 Error', async() => {
            const user = await User.findOne({emailAddress: "abouelhadid.ola@gmail.com"});
            const res = await request(app).patch(`/auth/reset-password/${user.forgotPasswordToken}`);
            testFormat(res, 400, "no new password found.");
        });
    });
});


//close the connection to the database
afterAll(async () => {
    await mongoose.connection.close();
});