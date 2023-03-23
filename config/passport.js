const passport = require("passport");
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const facebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
require('dotenv').config();

exports.googlePass= function(passport){
    passport.use(
        new googleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_APP_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACKURL
            },
        async function(accessToken, refreshToken, profile, done) {
            try {
                const { _json: profileInfo } = profile;
                console.log("google profile: ", profile);
                // Check if user signed up before using facebook
                const userExists = await User.findOne({ googleID: profile.id })
            
                if (userExists) {
                    return done(null, userExists)
                }


                // Create new user 
                const newUser = new User({
                    emailAddress: profileInfo.email,
                    googleID: profile.id,
                    isVerified: true
                })
            
                await newUser.save()
                done(null, newUser)
            } 

            catch (error) {
                done(error, false, error.message)
            }
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(id, done) {
        return done(null, id);
    });

}


exports.facebookPass = function(passport) {
    passport.use(
        new facebookStrategy(
            {
                clientID: process.env.FACEBOOK_CLIENT_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACKURL
            },
        async function(accessToken, refreshToken, profile, done) {
            try {
                const { _json: profileInfo } = profile;
                console.log("facebook profile: ", profile);
                // Check if user signed up before using facebook
                const userExists = await User.findOne({ facebookID: profile.id })
            
                if (userExists) {
                    return done(null, userExists)
                }
    
    
                // Create new user 
                const newUser = new User({
                    emailAddress: profileInfo.email,
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
    ));
    
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
      
    passport.deserializeUser(function(id, done) {
        return done(null, id);
    });
}

