const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const Event = require('../models/Events');
const Category = require('../models/Category');
const Venue = require('../models/Venue');
require("dotenv").config();

beforeAll(async () => {
    const url = "mongodb+srv://Eventbrite-backend:envie_backend_2023@eventbrite-cluster.krn9ebx.mongodb.net/TestDB?retryWrites=true&w=majority";
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await Event.deleteMany({});
    await Category.deleteMany({});
});

beforeEach(async () => {
    await Event.deleteMany({});
    await Category.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

function testFormat(res, statusCode, message){
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual(message);
    expect(res.statusCode).toEqual(statusCode);
}

async function createCategory(){
    const randomName = Math.random().toString(36).substring(7);
    const res = await request(app).post("/api/categories").send({
        "name": randomName,
    });
    return res.body.category._id;
}



describe("Categories", () => {
    describe("GET /categories", () => {
        it("should return 200 OK",async () => {
            const category1 = await createCategory();
            const category2 = await createCategory();
            const res = await request(app).get("/api/categories");
            expect(res.statusCode).toEqual(200);
            testFormat(res, 200, "Categories retrieved successfully");
            expect(res.body).toHaveProperty('categories');
            expect(res.body.categories).toHaveLength(2);
        });
    });

    describe("GET /categories/:id", () => {
        it("should return 200 OK",async () => {
            const createCategory = await request(app).post("/api/categories").send({
                "name": "Art",
            });
            const res = await request(app).get("/api/categories/" + createCategory.body.category._id);
        
            testFormat(res, 200, "Category retrieved successfully");
            expect(res.body).toHaveProperty('category');
            expect(res.body.category).toHaveProperty('name');
            expect(res.body.category.name).toEqual('Art');
        });

        it("should return 404 Not Found",async () => {
            const res = await request(app).get("/api/categories/641fedb3ac9bcd33f232e0f2");
            expect(res.statusCode).toEqual(404);
            testFormat(res, 404, "Category not found");
        });
    });

    describe("POST /categories", () => {
        it("should return 200 OK",async () => {
            const res = await request(app).post("/api/categories").send({
                "name": "Aly category",
            });
            testFormat(res, 200, "Category created successfully");
            expect(res.body).toHaveProperty('category');
            expect(res.body.category).toHaveProperty('name');
            expect(res.body.category.name).toEqual('Aly category');
        });

        it("should return 400 Bad Request due to name is missing",async () => {
            const res = await request(app).post("/api/categories").send({});
            testFormat(res, 400, "Category name is required");
        });

        it("should return 400 Bad Request due to dublicate",async () => {
            const firstReq = await request(app).post("/api/categories").send({
                "name": "Aly category",
            });
            const res = await request(app).post("/api/categories").send({
                "name": "Aly category",
            });
            testFormat(res, 400, "Category already exists");
        });
    });



    
});