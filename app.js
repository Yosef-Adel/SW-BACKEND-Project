const dotenv=require("dotenv");
const express = require('express');
const morgan = require('morgan');
const bp = require('body-parser');
const app= express();
var cors = require("cors");
const userRouter = require("./routes/userRoute");
const authRouter = require('./routes/authRoute');
const passport = require("passport");
const passportConfig = require("./config/passport");

const session = require("express-session");

app.use(express.json());
app.use(cors());
dotenv.config();

app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

passportConfig.googlePass(passport);
passportConfig.facebookPass(passport);



app.use(session({secret: process.env.JWT_KEY}));

//middleware & static files
app.use(express.static('public'));
app.use(morgan('dev'));


////////////// auth route //////////////
app.use('/auth', authRouter);

////////////// user route //////////////
app.use('/user', userRouter);




module.exports = app;