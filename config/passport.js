const passport = require("passport");
const facebookTokenMethod = require("passport-facebook-token");
const User = require("../models/User");
const genUsername = require("unique-username-generator");
require('dotenv').config();

passport.use(
    // new facebookTokenMethod(
    //     clientID: process.env.
    // )
);