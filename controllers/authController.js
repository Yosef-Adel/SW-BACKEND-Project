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
        // check for the required fields
        if (!(req.body.emailAddress && req.body.password && req.body.firstName && req.body.lastName)) 
        {
            return res.status(400).send("Please fill all the required inputs.");
        }
        // check for duplicate emails
        const isDuplicate = await User.findOne({emailAddress: req.body.emailAddress})

        if (isDuplicate) {
            return res.status(400).json({message: 'User validation failed: expected emailAddress to be unique.'});
        }
        // encrypt password using bycrypt
        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        //creating user using req body fields
        const user = await User.create({...req.body});
        user.password = hashedPass;
        //testing
        // generate a token for email verification
        user.verifyEmailToken = await user.generateEmailVerificationToken();
        await user.save();
        
        //sending verification email
        const verifyEmailText = `Please click on the link to complete the verification process https://sw-backend-project.vercel.app/auth/sign-up-verify/${user.verifyEmailToken}\n`;
        await sendMail({
        email: user.emailAddress,
        subject: `Verify your email address with Eventbrite`,
        message: verifyEmailText
        });
        //testing

        await user.save();
        // redirecting to front-end login page
        return res.status(200).json({message: 'Check your email for verification.'});
    }
    
    catch (err) {
        console.log(err.message)
        return res.status(400).json({ message: "Error in signing up" });
    }
};



/////////////////////////   account verification via token   /////////////////////////   

exports.verification = async (req, res) => {
    try{
        // find user associated with the verification token
        const user = await User.findOne({verifyEmailToken: req.params.token} );
        if (!user)  return res.status(400).json({message: "user not found"});
        
        // check if token is still valid
        let token = req.params.token;
        let valid = true;
        await jwt.verify(token, process.env.JWT_KEY, async (err) => {
            if (err) {
                valid=false;
            }
        });
        // if token is not valid, delete user so that sign-up process using same email can happen
        if (!valid){
            await User.findOneAndDelete({verifyEmailToken: req.params.token});
            return res.status(401).json({message: 'Token has expired. Please sign up again'});
        }
        // if valid, remove the associated token, and change verified to true
        user.verifyEmailToken = undefined;
        user.isVerified = true;
        
        await user.save();
        return res.redirect(301,"https://sw-frnt-project.vercel.app/login");  
        
}
    catch(err){
        console.log(err.message)
        return res.status(400).json({ message: "Error in verifying email address." });
    }
};


/////////////////////////   login + generating a token   /////////////////////////   

exports.login= async (req, res) => {
    try {
        // check for the required email address field
        if (!req.body.emailAddress){
            return res.status(400).json({message: "Please enter email address."})
        }
        // find the user associated with the email address
        const user = await User.findOne({emailAddress: req.body.emailAddress});
        
        if (!user)
        {
            return res.status(400).json({message: "user not found"})
        }
        // check if user has verified their email address first
        if (!user.isVerified)
        {
            return res.status(400).json({message: "Please verify your email first."});
        }
        //testing

        // compare password after hashing with encyrpted password in db
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) 
        {
            return res.status(400).json({message: "Password is incorrect"})
        }
        //generate user token for session
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
        // check for the required email address field
        if (!req.body.emailAddress) {
            return res.status(400).json({message: "no email address found"});
        }
        // find user associated with email address
        const user = await User.findOne({emailAddress: req.body.emailAddress});
        if (!user)
        {
            return res.status(400).json({message: "user not found"});
        }
        //check if user has verified their email address first
        if (!user.isVerified) {
            return res.status(400).json({message: "Please verify your email first."})
        }
        // testing

        // generate forget password token
        user.forgotPasswordToken = await user.generateForgotPasswordToken();
        
        //send email address with password token
        const forgotPasswordEmailText = `Click on the link to reset your password https://sw-frnt-project.vercel.app/forgetPassword/${user.forgotPasswordToken}\n`;
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
        // check for the required password field
        if (!req.body.password) return next(new appError('No password found.'));
        
        // find the user associated with the password token
        const user = await User.findOne({forgotPasswordToken: req.params.token});
        if (!user) return res.status(400).send("User not found");

        let token = req.params.token;
        let valid = true;
        // check if token has expired or not
        await jwt.verify(token, process.env.JWT_KEY, async (err) => {
            if (err) {
                valid=false;
            }
        });

        // if not valid, return status 400
        if (!valid){
            return res.status(401).json({message: 'Token has expired.'});
        }
        
        // encyrpt the new password
        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        user.password= hashedPass;  
        user.forgotPasswordToken=undefined;

        await user.save();
        return res.status(200).json({
            message: "password reset successfully"
        });
    }
    catch(err){
        console.log(err.message);
        return res.status(400).json({ message: "Error in resetting password" });
    }
};




/////////////////////////   sign in with google   /////////////////////////   

exports.googleCallback = async (req,res) => {
    try{
        const user = req.user;
        const token = await user.generateAuthToken();
        res.body={user, token};
        return res.redirect(301,"https://sw-frnt-project.vercel.app/");
    }    

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in redirecting to login page"});
    }
}
