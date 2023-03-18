const passport = require('passport');
const facebookTokenMethod = require("passport-facebook-token");
const User = require("../models/User");
const genUsername = require("unique-username-generator");
require('dotenv').config();

passport.use(
    new facebookTokenMethod(
        {
            clientID : process.env.FACEBOOK_CLIENT_ID,
            clientSecret : process.env.FACEBOOK_CLIENT_PASSWORD
        }
    ),
    async function(accessToken, refreshToken, profile, done){
        try{
            const {_json: profileInfo}= profile;
            // Check if user signed up before using facebook
            const userExists = await User.findOne({facebookID: profile.id})

            if (userExists){
                return done(null, userExists);
            }

            
        }
    }

);