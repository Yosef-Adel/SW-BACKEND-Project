const supertest = require('supertest');
const assert = require('assert');

const mongoose = require('mongoose');

const {signUp, verification, login, forgotPassword, resetPassword} = require('../controllers/authController');

const User = require('../models/User');

console.log("start testing")

jest.setTimeout(1000000);

beforeAll(async() => {
    await mongoose.connect("mongodb+srv://Eventbrite-backend:envie_backend_2023@eventbrite-cluster.krn9ebx.mongodb.net/TestDB?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    
    await User.deleteMany({});
    const user = new User({
        firstName: "Ola",
        lastName: "Abouelhadid",
        emailAddress:"abouelhadid.ola@gmail.com",
        isVerified: true,
        isCreator: true
    });
    await user.save();
});


describe('Sign up', () => {
    describe('Case1: signing up', () => {
        it('it should return 200', async() => {
            const req={
                body:{
                    firstName: "Mai",
                    lastName: "Abdelhameed",
                    emailAddress:"maiabdelhameed16@gmail.com",
                    password: "ayhaga"
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

            await signUp(req, res);
            assert.equal(res.statusCode, 200);
            assert.equal(res.data.message, 'Check your email for verification.');
        });
    });

    describe('Case2: signing up with duplicate emails', () => {
        it('it should return 400', async() => {
            const req={
                body:{
                    firstName: "Mai",
                    lastName: "Abdelhameed",
                    emailAddress:"maiabdelhameed16@gmail.com",
                    password: "ayhaga"
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
            
            await signUp(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.data.message, "users validation failed: emailAddress: Error, expected emailAddress to be unique.");
        });
    });

})


describe('login', () => {
    describe('Case 1: log in', () => {
        it('it should return 400', async() => {
            const req={
                body:{
                    emailAddress:"maiabdelhameed16@gmail.com",
                    password: "ayhaga"
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
            
            await login(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.data.message, "Please verify your email first.");
        });
    });

    describe('Case2: log in', () => {
        it('it should return 400', async() => {
            const req={
                body:{
                    "emailAddress": "mai@gmail.com",
                    "password": "ayhaga"
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

            await login(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.data.message, "user not found");
        });
    });

    describe('Case 3: log in', () => {
        it('it should return 200', async() => {
            const req={
                body:{
                    "emailAddress": "abouelhadid.ola@gmail.com",
                    "password": "ayhaga"
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

            await login(req, res);
            assert.equal(res.statusCode, 200);
            assert.equal(res.data.message, "successfully logged in");
        });
    });


})

describe('forgot Password', () => {
    describe('Case1: sending token', () => {
        it('it should return 200', async() => {
            const req={
                body:{
                    emailAddress:"abouelhadid.ola@gmail.com"
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

            await forgotPassword(req, res);
            assert.equal(res.statusCode, 200);
            assert.equal(res.data.message, 'Password token sent to email');
        });
    });

    describe('Case2: not finding user', () => {
        it('it should return 400', async() => {
            const req={
                body:{
                    emailAddress:"maiabdelhameed1@gmail.com",
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
            
            await forgotPassword(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.data.message, "user not found");
        });
    });

    describe('Case 3: unverified email', () => {
        it('it should return 400', async() => {
            const req={
                body:{
                    emailAddress:"maiabdelhameed16@gmail.com",
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
            
            await forgotPassword(req, res);
            assert.equal(res.statusCode, 400);
            assert.equal(res.data.message, "Please verify your email first.");
        });
    });

})



//close the connection to the database
afterAll(async () => {
    await mongoose.connection.close();
});