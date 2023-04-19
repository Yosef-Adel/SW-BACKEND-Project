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
let organizationId;
let organizerId;

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

    const res2 = await request(app).post('/organization/create/'+ userId).send({"name": "test organization"}).set('Authorization', 'Bearer ' + token);
    organizationId = res2.body.organization._id;

    const organizer = new Organization({
        name: "organizer"
    });
    await organizer.save();

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



describe('Creating organizer', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).post('/organization/' + organizationId + '/organizer/create').send({
                "name": "test organizer"
            }).set('Authorization', 'Bearer ' + token);
            organizerId = res.body.organizer._id;
            testFormat(res, 200, "Organizer created successfully");
            expect(res.body).toHaveProperty('organizer');
        });
    });

    describe('Case 2: Name field missing', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post(`/organization/${organizationId}/organizer/create`).set('Authorization', 'Bearer ' + token);
            testFormat(res,400, "Organizer name is required");
        });
    });

    describe('Case 3: Organization not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post(`/organization/${objectId}/organizer/create`).send({
                "name": "test organizer"
            }).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "Organization not found.");
        });
    });

    describe('Case 4: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post(`/organization/${organizationId}/organizer/create/`).send({
                "name": "test organizer"
            });
            console.log(res.body);
            testFormat(res, 401, 'No token provided!');
        });
    });

    describe('Case 5: User not authorized', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post(`/organization/${organizationId}/organizer/create/`).send({
                "name": "test organization"
            }).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    });
});

describe('Updating organizer', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).put('/organization/organizer/edit/'+ organizerId).send({
                "name": "orgnizer tany"
            }).set('Authorization', 'Bearer ' + token);
            testFormat(res, 200, "Organizer info updated successfully");
            expect(res.body).toHaveProperty('organizer');
        });
    });

    describe('Case 2: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).put('/organization/organizer/edit/'+ objectId).send({
                "name": "test organizer"
            }).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "Organizer not found");
        });
    });

    describe('Case 3: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).put('/organization/organizer/edit/'+ organizerId).send({
                "name": "test organizer"
            });
            testFormat(res, 401, 'No token provided!');
        });
    });

    describe('Case 4: User not authorized', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).put('/organization/organizer/edit/'+ organizerId).send({
                "name": "test organizer"
            }).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    });
});


describe('Getting organizer info', () => {
    describe('Case 1: Success.', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get('/organization/organizer/'+ organizerId).set('Authorization', 'Bearer ' + token);
            testFormat(res, 200, "Success");
            expect(res.body).toHaveProperty('organizer');
        });
    });

    describe('Case 2: Organizer not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/organization/organizer/'+ objectId).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "Organizer not found");
        });
    });

    describe('Case 3: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/organization/organizer/'+ organizerId);
            testFormat(res, 401, 'No token provided!');
        });
    });

    describe('Case 4: User not authorized', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get('/organization/organizer/'+ organizerId).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    });
});


describe('Deleting organizer', () => {
    describe('Case 1: Success.', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).delete(`/organization/${organizationId}/organizer/delete/${organizerId}`).set('Authorization', 'Bearer ' + token);
            testFormat(res, 200, "Organizer deleted successfully.");
        });
    });

    describe('Case 2: Organizer not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).delete(`/organization/${organizationId}/organizer/delete/${objectId}`).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "Organizer not found");
        });
    });

    describe('Case 3: Organization not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).delete(`/organization/${objectId}/organizer/delete/${organizerId}`).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "Organization not found");
        });
    });

    describe('Case 4: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).delete(`/organization/${organizationId}/organizer/delete/${organizerId}`);
            testFormat(res, 401, 'No token provided!');
        });
    });

    describe('Case 5: User not authorized', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).delete(`/organization/${organizationId}/organizer/delete/${organizerId}`).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    });
});

