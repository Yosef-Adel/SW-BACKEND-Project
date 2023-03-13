const http = require("http");
const dotenv=require("dotenv");
const express = require('express');
const morgan = require('morgan');
const mongoose= require('mongoose');
const bp = require('body-parser');
const app= express();
var cors = require("cors");
const userRouter = require("./routes/userRoute");

app.use(express.json());
app.use(cors());
// Set up Global configuration access
dotenv.config();
let port = process.env.PORT || 3000;

//connect to mongodbs
const db=process.env.NGO_URL_HOSTED;
mongoose.set('strictQuery', true);
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then((result)=> app.listen(port, () => console.log(`Server running on port ${port}`)))
.catch((err)=>console.log('DB connection error',err));


app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))


//middleware & static files
app.use(express.static('public'));
app.use(morgan('dev'));



app.use('/api/users', userRouter);