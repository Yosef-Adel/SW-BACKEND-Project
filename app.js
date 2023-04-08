const dotenv=require("dotenv");
const express = require('express');
const morgan = require('morgan');
const bp = require('body-parser');
const app= express();
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

var cors = require("cors");

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


const userRouter = require("./routes/userRoute");
const eventRouter = require("./routes/eventRoute");
const categoryRouter = require("./routes/categoryRoute");
const authRouter = require('./routes/authRoute');
const orderRouter = require('./routes/orderRoute');
const ticketRouter = require('./routes/ticketRoute');
const promocodeRouter = require('./routes/promocodeRoute');
const venueRouter = require('./routes/venueRoute');
const qrCodeRouter = require('./routes/qrCodeRoute');
const organizationRouter = require('./routes/organizationRoute');


const passport = require("passport");
const passportConfig = require("./config/passport");

const session = require("express-session");

app.use(express.json({ extended: false }));
app.use(cors());
dotenv.config();

app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))


passportConfig.googlePass(passport);




// const uploadImage = async(req, res) => {
//     return res.json({image: req.file.path})
// }
// app.post("/", upload.single("image"), uploadImage);


app.use(session({
    secret: process.env.JWT_KEY,
    resave: false,
    saveUninitialized: true.valueOf
}));

//middleware & static files
app.use(express.static('public'));
app.use(morgan('dev'));


////////////// auth route //////////////
app.use('/auth', authRouter);


////////////// user route //////////////
app.use('/user', userRouter);


//////////////order route //////////////
app.use('/order', orderRouter);


//////////////ticket route //////////////
app.use('/ticket', ticketRouter);


//////////////promocode route //////////////
app.use('/promocode', promocodeRouter);


//////////////venue route //////////////
app.use('/venue', venueRouter);


//////////////qrCode route //////////////
app.use('/qrCode', qrCodeRouter);


//////////////event route //////////////
app.use('/api/events', eventRouter);


//////////////categories route //////////////
app.use('/api/categories', categoryRouter);


//////////////organization route //////////////
app.use('/organization', organizationRouter);


//////////////organizer route //////////////
// app.use('/organizer', organizerRouter);


module.exports = app;