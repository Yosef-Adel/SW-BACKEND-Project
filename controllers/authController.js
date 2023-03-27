const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const {sendMail} = require('../utils/emailVerification');
const crypto = require('crypto');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Date = require("date.js");
const saltRounds = 10;
const password = "Admin@123";



/////////////////////////   setting bycrypt to hash password   /////////////////////////  

bcrypt.genSalt(saltRounds)
    .then(salt => {
    // console.log('Salt: ', salt);
    return bcrypt.hash(password, salt)
    }).then(hash => {
    // console.log('Hash: ', hash);
    }).catch(err => console.error(err.message));


// const signToken = id => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })};




/////////////////////////   sign up + sending verification email   /////////////////////////   

const signUp= async (req, res) => {
    try{
        const isDuplicate = await User.findOne({emailAddress: req.body.emailAddress})
        console.log(isDuplicate)
        if (isDuplicate) {
            return res.status(400).json({message: 'users validation failed: emailAddress: Error, expected emailAddress to be unique.'});
        }

        console.log("hi")

        if (!(req.body.emailAddress && req.body.password && req.body.firstName && req.body.lastName)) 
        {
            return res.status(400).send("Please fill all the required inputs.");
        }

        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);

        const user = await User.create({
        emailAddress: req.body.emailAddress,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPass
        });
        console.log('user created', user); 
        
        //testing
        user.verifyEmailToken = await user.generateEmailVerificationToken();
        user.verifyEmailTokenExpiry= new Date(process.env.JWT_EXPIRE);
        await user.save();
        const verifyEmailText = `Please click on the link to complete the verification process http://localhost:3000/auth/sign-up-verify/${user.verifyEmailToken}\n`;
        console.log(user.verifyEmailToken);
        
        await sendMail({
        email: user.emailAddress,
        subject: `Verify your email address with Eventbrite`,
        message: verifyEmailText
        });
        //testing

        return res.status(200).json({
            message: 'Check your email for verification.'}
            );
    }
    
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};




/////////////////////////   account verification via token   /////////////////////////   

const verification = async (req, res) => {
    try{
        if (!req.params.token)  return res.status(400).json({message: "no email verification token found"})

        const user = await User.findOne({verifyEmailToken: req.params.token} );
        if (!user)  return res.status(400).json({message: "user not found"});
        
        const currDate = new Date();
        const valid = (currDate < user.verifyEmailTokenExpiry);
        if (!valid)
        {
            await User.findOneAndDelete({verifyEmailToken: req.params.token})
            return res.status(400).json({message: 'Token has expired. Please sign up again'});
        }

        user.verifyEmailToken = undefined;
        user.verifyEmailTokenExpiry = undefined;
        user.isVerified = true;
        await user.save();
        console.log("saved");
        
        

        return res.status(200).json({
            message:'Successfully verified. You can login now'
        });  
        
}
    catch(err){
        return res.status(400).json({ message: err.message });
    }
};




/////////////////////////   login + generating a token   /////////////////////////   

const login= async (req, res) => {
    try {
        if (req.body.emailAddress){
            const user = await User.findOne({emailAddress: req.body.emailAddress});

            if (!user)
            {
                return res.status(400).json({message: "user not found"})
            }
            
            console.log(user.password);
            console.log(req.body.password);
            
            //testing
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            console.log(isMatch);
            if (!isMatch) 
            {
                return res.status(400).json({message: "Password is incorrect"})
            }

            const token = await user.generateAuthToken();
            //testing

            console.log("user logged-in", user);

            //special return for testing
            // return res.status(200).json({message:"successfully logged in"});
            
            return res.json({token, user});

        }
    }

    catch(err){
        return res.status(400).json({message: err.message});
    }
};




/////////////////////////   sending forgot password email with a token   /////////////////////////   

const forgotPassword = async (req, res) => {
    try{

        console.log("inside try and email = ", req.body.emailAddress)
        const user = await User.findOne({emailAddress: req.body.emailAddress});

        if (!user)
        {
            return res.status(400).json({message: "user not found"});
        }

        if (!user.isVerified) {
            return res.status(400).json({message: "Please verify your email first."})
        }
        console.log("user found", user);
        
        // testing
        const forgotPasswordToken = await user.generateForgotPasswordToken();
        user.forgotPasswordTokenExpiry= Date(process.env.JWT_EXPIRE);
        const forgotPasswordEmailText = `Click on the link to reset your password http://localhost:3000/reset-password/${forgotPasswordToken}\n`;

        await sendMail({
            email: req.body.emailAddress,
            subject: `We received a request to reset your password for your Eventbrite account`,
            message:forgotPasswordEmailText
        });
        //testing
        
        await user.save();

        return res.status(200).json({
            message: 'Password token sent to email'
        });
    }

    catch (err){
        
        return res.status(400).json({message: err.message});
    }
    
};




/////////////////////////   reseting password via token   /////////////////////////   

const resetPassword = async (req, res) => {
    try{
        if (!req.params.token) return res.status(400).json({message: 'No email confirmation token found.'});

        if (!req.body.password) return next(new appError('No email confirmation token found.'));
        
        const user = await User.findOne({forgotPasswordToken: req.params.token});
        if (!user) res.status(400).send("User not found");

        const currDate = new Date();
        const valid = (currDate < user.forgotPasswordTokenExpiry);
        if (!valid)
        {
            return res.status(400).json({message: 'Token has expired. Please click on forgot password again'});
        }
        
        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        user.password= hashedPass;  
        user.forgotPasswordToken=undefined;
        user.forgotPasswordTokenExpiry=undefined;

        await user.save();
        return res.status(200).json({
            message: "password reset successfully"
        });
    }
    catch(err)
    {
        return res.status(400).json({message: err.message});
    }
};




/////////////////////////   sign in with google   /////////////////////////   

const googleCallback = async (req,res) => {
    res.status(200).json({message: "done"});
}




/////////////////////////   sign in with facebook   /////////////////////////   

const facebookCallback = async (req,res) => {
    res.redirect('/home');
};


module.exports = {signUp, login, verification, forgotPassword, resetPassword, facebookCallback, googleCallback};