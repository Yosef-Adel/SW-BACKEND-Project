const passport = require("passport");
const facebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const genUsername = require("unique-username-generator");
require('dotenv').config();

passport.use(
    // new facebookTokenMethod(
    //     clientID: process.env.
    // )
);

module.exports = passport;