const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require('../models/User');
const bcrypt = require("bcryptjs");

jest.setTimeout(10000000000000);


let userId;
let token;
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
        icCreator: false
    });
    await user.save();
    const res = await request(app).post("/auth/login").send({
        "emailAddress": "maiabdelhameed@gmail.com",
        "password":"ayhaga"
    });
    userId = res.body.user._id;
    token = res.body.token;
});



function testFormat(res, statusCode, message){
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(message);
    expect(res.statusCode).toEqual(statusCode);
}



describe('Get Info', () => {
    describe('Case 1: getting info successfully', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get('/user/'+ userId).set("Authorization", "Bearer " + token);
            testFormat(res, 200, "Success");
            expect(res.body).toHaveProperty('user');
        });
    });

    describe('Case 2: user not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get("/user/" + objectId).set("Authorization", "Bearer " + token);
            testFormat(res, 400, "User not found");
        });
    });

    describe('Case 3: Invalid token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/user/'+ userId);
            testFormat(res, 401, 'No token provided!');
        });
    });
});


describe('Updating Info', () => {
    describe('Case 1: Updating info successfully', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).put('/user/edit/'+ userId).send({
                "firstName": "Maii"
            }).set("Authorization", "Bearer " + token);

            testFormat(res, 200, "Updated info successfully");
            expect(res.body).toHaveProperty('user');
        });
    });

    describe('Case 2: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).put('/user/edit/'+ objectId).send({
                "firstName": "Maii"
            }).set("Authorization", "Bearer " + token);
            testFormat(res, 400, "User not found");
        });
    });

    describe('Case 3: Invalid token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).put('/user/edit/'+ userId).send({
                "firstName": "Maii"
            });
            testFormat(res, 401, 'No token provided!');
        });
    });
});


describe('Changing attendee view to creator view', () => {
    describe('Case 1: Changing view successfully', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get('/user/to-creator/' + userId).set("Authorization", "Bearer " + token);
            expect(res.statusCode).toEqual(200);
            expect(res.body.isCreator).toEqual(true);
        });
    });

    describe('Case 2: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/user/to-creator/' + userId);
            testFormat(res, 401, 'No token provided!');
        })
    });

    describe('Case 3: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/user/to-creator/' + objectId).set("Authorization", "Bearer " + token);
            testFormat(res, 400, "User not found");
        })
    });
});



describe('Changing creator view to attendee view', () => {
    describe('Case 1: Changing view successfully', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get('/user/to-attendee/' + userId).set("Authorization", "Bearer " + token);
            expect(res.statusCode).toEqual(200);
            expect(res.body.isCreator).toEqual(false);
        })
    });

    describe('Case 2: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/user/to-attendee/' + userId);
            testFormat(res, 401, 'No token provided!');
        })
    });

    describe('Case 3: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/user/to-attendee/' + objectId).set("Authorization", "Bearer " + token);
            testFormat(res, 400, 'User not found');
        })
    });
});


//close the connection to the database
afterAll(async () => {
    await mongoose.connection.close();
})