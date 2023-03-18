const dotenv=require("dotenv");
const express = require('express');
const morgan = require('morgan');
const bp = require('body-parser');
const app= express();
var cors = require("cors");
const userRouter = require("./routes/userRoute");
const eventRouter = require("./routes/eventRoute");
const categoryRouter = require("./routes/categoryRoute");

app.use(express.json());
app.use(cors());
dotenv.config();

app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

//middleware & static files
app.use(express.static('public'));
app.use(morgan('dev'));

app.use('/api/users', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/categories', categoryRouter);

module.exports = app;