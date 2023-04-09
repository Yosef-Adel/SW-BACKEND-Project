const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const {sendMail} = require('../utils/emailVerification');
const saltRounds = 10;
const password = "Admin@123";


/////////////////////////   setting bycrypt to hash password   /////////////////////////  

bcrypt.genSalt(saltRounds)
    .then(salt => {
    return bcrypt.hash(password, salt)
    }).then(hash => {
    }).catch(err => console.error(err.message));


/////////////////////////   sign up + sending verification email   /////////////////////////   

exports.signUp= async (req, res) => {
    try{
        if (!(req.body.emailAddress && req.body.password && req.body.firstName && req.body.lastName)) 
        {
            return res.status(400).send("Please fill all the required inputs.");
        }

        const isDuplicate = await User.findOne({emailAddress: req.body.emailAddress})

        if (isDuplicate) {
            return res.status(400).json({message: 'User validation failed: expected emailAddress to be unique.'});
        }

        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);

        const user = await User.create({...req.body});
        user.password = hashedPass;
        
        //testing
        user.verifyEmailToken = await user.generateEmailVerificationToken();
        await user.save();
        const verifyEmailText = `Please click on the link to complete the verification process http://localhost:3000/auth/sign-up-verify/${user.verifyEmailToken}\n`;
        
        await sendMail({
        email: user.emailAddress,
        subject: `Verify your email address with Eventbrite`,
        message: verifyEmailText
        });
        //testing

        await user.save();
        return res.status(200).json({
            message: 'Check your email for verification.'}
            );
    }
    
    catch (err) {
        console.log(err.message)
        return res.status(400).json({ message: "Error in signing up" });
    }
};




/////////////////////////   account verification via token   /////////////////////////   

exports.verification = async (req, res) => {
    try{
        //if (!req.params.token)  return res.status(400).json({message: "no email verification token found"})

        const user = await User.findOne({verifyEmailToken: req.params.token} );
        if (!user)  return res.status(400).json({message: "user not found"});
        
        let token = req.params.token;
        let valid = true;
        await jwt.verify(token, process.env.JWT_KEY, async (err) => {
            if (err) {
                valid=false;
            }
        });
        if (!valid){
            await User.findOneAndDelete({verifyEmailToken: req.params.token});
            return res.status(401).json({message: 'Token has expired. Please sign up again'});
        }

        user.verifyEmailToken = undefined;
        user.isVerified = true;
        await user.save();
        return res.status(200).json({
            message:'Successfully verified. You can login now'
        });  
        
}
    catch(err){
        console.log(err.message)
        return res.status(400).json({ message: "Error in verifying email address." });
    }
};




/////////////////////////   login + generating a token   /////////////////////////   

exports.login= async (req, res) => {
    try {
        if (!req.body.emailAddress){
            return res.status(400).json({message: "Please enter email address."})
        }

        const user = await User.findOne({emailAddress: req.body.emailAddress});
        
        if (!user)
        {
            return res.status(400).json({message: "user not found"})
        }

        if (!user.isVerified)
        {
            return res.status(400).json({message: "Please verify your email first."});
        }

        //testing
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) 
        {
            return res.status(400).json({message: "Password is incorrect"})
        }
        const token = await user.generateAuthToken();
        //testing

        //special return for testing
        // return res.status(200).json({message:"successfully logged in"});
        
        return res.status(200).json({token, user});
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({ message: "Error in logging in" });
    }
};




/////////////////////////   sending forgot password email with a token   /////////////////////////   

exports.forgotPassword = async (req, res) => {
    try{
        const user = await User.findOne({emailAddress: req.body.emailAddress});

        if (!user)
        {
            return res.status(400).json({message: "user not found"});
        }

        if (!user.isVerified) {
            return res.status(400).json({message: "Please verify your email first."})
        }
        
        // testing
        const forgotPasswordToken = await user.generateForgotPasswordToken();
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
        console.log(err.message)
        return res.status(400).json({ message: "Error in sending forgot-password email" });
    }
    
};




/////////////////////////   reseting password via token   /////////////////////////   

exports.resetPassword = async (req, res) => {
    try{
        if (!req.params.token) return res.status(400).json({message: 'No email confirmation token found.'});

        if (!req.body.password) return next(new appError('No email confirmation token found.'));
        
        const user = await User.findOne({forgotPasswordToken: req.params.token});
        if (!user) return res.status(400).send("User not found");

        let token = req.params.token;
        let valid = true;

        await jwt.verify(token, process.env.JWT_KEY, async (err) => {
            if (err) {
                valid=false;
            }
        });

        if (!valid){
            return res.status(401).json({message: 'Token has expired.'});
        }
        
        
        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        user.password= hashedPass;  
        user.forgotPasswordToken=undefined;

        await user.save();
        return res.status(200).json({
            message: "password reset successfully"
        });
    }
    catch(err){
        console.log(err.message)
        return res.status(400).json({ message: "Error in resetting password" });
    }
};




/////////////////////////   sign in with google   /////////////////////////   

exports.googleCallback = async (req,res) => {
    res.status(200).json({message: "done"});
}
