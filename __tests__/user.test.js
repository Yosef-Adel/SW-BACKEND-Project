const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require('../models/User');
const Event = require('../models/Events');
const bcrypt = require("bcryptjs");

jest.setTimeout(1000000);


let userId;
let token;

let newUserId;
let newToken;
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
        isCreator: false
    });
    await user.save();
    const res = await request(app).post("/auth/login").send({
        "emailAddress": "maiabdelhameed@gmail.com",
        "password":"ayhaga"
    });
    userId = res.body.user._id;
    token = res.body.token;


    let newUser = new User({
        firstName: "Mai",
        lastName: "Abdelhameed",
        emailAddress:"maiabdelhameedd@gmail.com",
        password: await bcrypt.hash("ayhaga", 10),
        isVerified: true,
        isCreator: true
    });
    await newUser.save();
    const newRes = await request(app).post("/auth/login").send({
        "emailAddress": "maiabdelhameedd@gmail.com",
        "password":"ayhaga"
    });
    newUserId = newRes.body.user._id;
    newToken = newRes.body.token;


    let event = new Event({
        "name": "test",
        "startDate":"2023-04-18T19:00",
        "endDate":"2023-04-18T19:00",
        "category":"Music",
        "createdBy": newUserId
    });
    await event.save();

    let newEvent = new Event({
        "name": "test",
        "startDate":"2024-04-18T19:00",
        "endDate":"2024-04-18T19:00",
        "category":"Music",
        "createdBy": newUserId
    });
    await newEvent.save();
});


//close the connection to the database
afterAll(async () => {
    await mongoose.connection.close();
})


function testFormat(res, statusCode, message){
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(message);
    expect(res.statusCode).toEqual(statusCode);
}



describe('Get Info', () => {
    describe('Case 1: Success', () => {
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
    describe('Case 1: Success', () => {
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
    describe('Case 1: Success', () => {
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
        });
    });

    describe('Case 3: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/user/to-creator/' + objectId).set("Authorization", "Bearer " + token);
            testFormat(res, 400, "User not found");
        })
    });
});



describe('Changing creator view to attendee view', () => {
    describe('Case 1: Success', () => {
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


describe('Getting user events', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get(`/api/events/${newUserId}/all-events`).set("Authorization", "Bearer " + newToken);
            testFormat(res, 200, "Success");
        })
    });

    describe('Case 2: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${newUserId}/all-events`);
            testFormat(res, 401, 'No token provided!');
        })
    });

    describe('Case 3: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${objectId}/all-events`).set("Authorization", "Bearer " + token);
            testFormat(res, 400, 'You are not a creator');
        })
    });
});

describe('Getting user past events', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get(`/api/events/${newUserId}/past-events`).set("Authorization", "Bearer " + newToken);
            testFormat(res, 200, "Success");
        })
    });

    describe('Case 2: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${newUserId}/past-events`);
            testFormat(res, 401, 'No token provided!');
        })
    });

    describe('Case 3: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${objectId}/past-events`).set("Authorization", "Bearer " + token);
            testFormat(res, 400, 'You are not a creator');
        })
    });
});


describe('Getting user upcoming events', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get(`/api/events/${newUserId}/upcoming-events`).set("Authorization", "Bearer " + newToken);
            testFormat(res, 200, "Success");
        })
    });

    describe('Case 2: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${newUserId}/upcoming-events`);
            testFormat(res, 401, 'No token provided!');
        })
    });

    describe('Case 3: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${objectId}/upcoming-events`).set("Authorization", "Bearer " + token);
            testFormat(res, 400, 'You are not a creator');
        })
    });
});

describe('Deleting user', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).delete(`/user/delete/${newUserId}`).set("Authorization", "Bearer " + newToken);
            testFormat(res, 200, "User deleted successfully.");
        })
    });

    describe('Case 2: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).delete(`/user/delete/${objectId}`).set("Authorization", "Bearer " + token);
            testFormat(res, 400, 'User not found');
        })
    });
});