const passport = require("passport");
const facebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const genUsername = require("unique-username-generator");
require('dotenv').config();

passport.use(
    new facebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientPassword: process.env.FACEBOOK_APP_SECRET
        }
    ),
    async function(accessToken, refreshToken, profile, done) {
        try {
            const { _json: profileInfo } = profile;
            // Check if user signed up before using facebook
            const userExists = await User.findOne({ facebookID: profile.id })
        
            if (userExists) {
                return done(null, userExists)
            }


            // Create new user 
            const newUser = new User({
                email: profileInfo.email,
                facebookID: profile.id,
                isVerified: true
            })
        
            await newUser.save()
            done(null, newUser)
            } 
            catch (error) {
            done(error, false, error.message)
            }
    }
);

module.exports = passport;