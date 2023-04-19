const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const User = require('../models/User');
const Organization = require("../models/Organization");
const Organizer = require("../models/Organizer");
const Event = require('../models/Events');
const bcrypt = require("bcryptjs");
const Date = require('date.js');

jest.setTimeout(1000000);


let userId;
let token;
let userId1;
let token1;
const objectId = mongoose.Types.ObjectId('569ed8269353e9f4c51617aa');
let organizationId;

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

    const event = new Event({
        name: "test",
        description: "test",
        summary: "test",
        startDate: new Date(),
        endDate: new Date(),
        capacity: 100,
        venueName: "test",
        city: "test",
        address1: "test",
        country: "test",
        postalCode: 1454,
        hostedBy: objectId,
        category: objectId
    });

    await event.save();

    const event1 = new Event({
        name: "test",
        description: "test",
        summary: "test",
        startDate: new Date("11/20/2014 04:11"),
        endDate: new Date("11/20/2014 04:11"),
        capacity: 100,
        venueName: "test",
        city: "test",
        address1: "test",
        country: "test",
        postalCode: 1454,
        hostedBy: objectId,
        category: objectId
    });

    await event1.save();
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
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).post('/organization/create/'+ userId).send({
                "name": "test organization",
                "organizers": objectId
            }).set('Authorization', 'Bearer ' + token);
            
            organizationId=res.body.organization._id;
            // console.log(res.body.organization);

            testFormat(res, 200, "Organization created successfully");
            expect(res.body).toHaveProperty('organization');
        });
    });

    describe('Case 2: Name field missing', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post('/organization/create/' + userId).set('Authorization', 'Bearer ' + token);
            testFormat(res,400,"Organization name is required.");
        });
    });

    describe('Case 3: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post('/organization/create/' + objectId).send({
                "name": "test organization"
            }).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, 'User not found');
        });
    });

    describe('Case 4: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post('/organization/create/' + objectId).send({
                "name": "test organization"
            });
            testFormat(res, 401, 'No token provided!');
        });
    });

    describe('Case 5: User not authorized', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).post('/organization/create/' + userId1).send({
                "name": "test organization"
            }).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    });
    
});



describe('Updating organization', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).put('/organization/edit/'+ organizationId).send({
                "name": "test organization updated"
            }).set('Authorization', 'Bearer ' + token);
            testFormat(res, 200, "Organization info updated successfully");
            expect(res.body).toHaveProperty('organization');
        });
    });

    describe('Case 2: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).put('/organization/edit/'+ objectId).send({
                "name": "test organization"
            }).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "Organization not found");
        });
    });

    describe('Case 3: Invalid Token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).put('/organization/edit/'+ organizationId).send({
                "name": "test organization"
            });
            testFormat(res, 401, 'No token provided!');
        });
    });

    describe('Case 4: User not authorized', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).put('/organization/edit/'+ organizationId).send({
                "name": "test organization"
            }).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    });
});


describe('Getting organization', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get(`/organization/${organizationId}`).set('Authorization', 'Bearer ' + token);
            testFormat(res, 200, "Success");
        });
    }) ;

    describe('Case 2: Organization not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/organization/${objectId}`).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "Organization not found");
        });
    }) ;

    describe('Case 3: Unauthorized user', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/organization/${organizationId}`).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    }) ;

    describe('Case 4: Invalid token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/organization/${organizationId}`);
            testFormat(res, 401, "No token provided!");
        });
    }) ;
});


describe('Getting events of an organization', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).get(`/organization/${organizationId}/events`).set('Authorization', 'Bearer ' + token);
            testFormat(res, 200, "Success");
        });
    }) ;

    describe('Case 2: Organization not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/organization/${objectId}/events`).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "Organization not found");
        });
    }) ;

    describe('Case 3: Unauthorized user', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/organization/${organizationId}/events`).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    }) ;

    describe('Case 4: Invalid token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/organization/${organizationId}/events`);
            testFormat(res, 401, "No token provided!");
        });
    });
});


describe('Getting upcoming events of an organization', () => {
    // describe('Case 1: Success', () => {
    //     it('it should return 200 OK', async() => {
    //         const res = await request(app).get(`/api/events/${userId}/upcoming-events`).set('Authorization', 'Bearer ' + token);
    //         testFormat(res, 200, "Success");
    //     });
    // }) ;

    describe('Case 1: User not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${objectId}/upcoming-events`).set('Authorization', 'Bearer ' + token);
            testFormat(res, 400, "This user doesn't have an organization.");
        });
    });

    describe('Case 2: Unauthorized user', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${userId}/upcoming-events`).set('Authorization', 'Bearer ' + token1);
            testFormat(res, 400, "You are not a creator");
        });
    }) ;

    describe('Case 3: Invalid token', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).get(`/api/events/${userId}/upcoming-events`);
            testFormat(res, 401, "No token provided!");
        });
    });
});



describe('Deleting organization', () => {
    describe('Case 1: Success', () => {
        it('it should return 200 OK', async() => {
            const res = await request(app).delete(`/organization/delete/${organizationId}`);
            testFormat(res, 200, "Organization deleted successfully");
        });
    }) ;

    describe('Case 2: Organization not found', () => {
        it('it should return 400 Error', async() => {
            const res = await request(app).delete(`/organization/delete/${objectId}`);
            testFormat(res, 400, "Organization not found");
        });
    }) ;
});