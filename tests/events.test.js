const request = require("supertest");
const app = require("../app");

// jest.useFakeTimers('legacy');

describe("Events", () => {
    describe("GET /events", () => {
        it("should return 200 OK",async () => {
            await request(app)
                .get("/api/events/")
                .expect(200);
        });
    });
    
    describe("GET /events/:id", () => {
        it("should return 200 OK",async () => {
            await request(app)
                .get("/api/events/1")
                .expect(200);
        });
    });


});