const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const sendMail = require('../utils/emailVerification');
const crypto = require('crypto');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Date = require("date.js");
const saltRounds = 10;
const password = "Admin@123";




/////////////////////////   setting bycrypt to hash password   /////////////////////////  

bcrypt.genSalt(saltRounds)
    .then(salt => {
    console.log('Salt: ', salt);
    return bcrypt.hash(password, salt)
    }).then(hash => {
    console.log('Hash: ', hash);
    }).catch(err => console.error(err.message));


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })};




/////////////////////////   sign up + sending verification email   /////////////////////////   

const signUp= async (req, res) => {
    try{
        const user = await User.create({
        emailAddress: req.body.emailAddress,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
        });
        console.log('user created', user);

        if (!(user.emailAddress && user.password && user.firstName && user.lastName)) 
        {
            res.status(400).send("Please fill all the required inputs.");
        }

        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        user.password= hashedPass;  
        
        const verifyEmailToken = await user.generateEmailVerificationToken();
        user.verifyEmailTokenExpiry= Date(process.env.JWT_EXPIRE);
        const verifyEmailText = `Please click on the link to complete the verification process http://localhost:3000/sign-up-verify/${verifyEmailToken}\n`;
        
        await sendMail({
        email: user.emailAddress,
        subject: `Verify your email address with Eventbrite`,
        message: verifyEmailText
        });
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Check your email for verification.'}
            );
    }
    
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};




/////////////////////////   account verification via token   /////////////////////////   

const verification = catchAsync(async (req, res, next) => {
    try{
        if (!req.params.token)
    return next(new appError('No email confirmation token found.'));

    //const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');


    const user = await User.findOne({verifyEmailToken: req.params.token} );
    if (!user) return next(new appError(`Token is invalid or has expired`, 400));

    user.verifyEmailToken = undefined;
    user.verifyEmailTokenExpiry = undefined;
    user.isVerified = true;
    await user.save();
    console.log("saved");
    
    res.status(200).json({
        status: 'Success',
        success: true,
        expireDate: process.env.JWT_EXPIRE,
        secret: process.env.JWT_SECRET
        });  
    }
    catch(err){
        return res.status(400).json({ message: err.message });
    }
});




/////////////////////////   login + generating a token   /////////////////////////   

const login= async (req, res) => {
    try {
        if (req.body.emailAddress){
            const user = await User.findOne({emailAddress: req.body.emailAddress});

            if (!user)
            {
                throw new Error("User is not found");
            }
            
            console.log(user.password);
            console.log(req.body.password);
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            console.log(isMatch);
            if (!isMatch) 
            {
                throw new Error("Password is incorrect");
            }

            const token = await user.generateAuthToken();
            
            console.log("user logged-in", user);

            return res.json({token, user});

        }
    }

    catch(err){
        return res.status(400).json({message: err.message});
    }
};




/////////////////////////   sending forgot password email with a token   /////////////////////////   

const forgotPassword = catchAsync(async (req, res) => {
    try{

        console.log("inside try and email = ", req.body.emailAddress)
        const user = await User.findOne({emailAddress: req.body.emailAddress});

        if (!user)
        {
            res.status(400).send("User not found");
        }
        console.log("user found", user);
        
        const forgotPasswordToken = await user.generateForgotPasswordToken();
        user.forgotPasswordTokenExpiry= Date(process.env.JWT_EXPIRE);
        const forgotPasswordEmailText = `Click on the link to reset your password http://localhost:3000/reset-password/${forgotPasswordToken}\n`;

        await user.save();
        
        await sendMail({
            email: req.body.emailAddress,
            subject: `We received a request to reset your password for your Eventbrite account`,
            message:forgotPasswordEmailText
        });

        

        res.status(200).json({
            status: 'success',
            message: 'Password token sent to email'
        });
    }
    catch (err){
        
        throw new appError(`There was an error in sending forgot password token. ${err}`, 400);
    }
    
});




/////////////////////////   reseting password via token   /////////////////////////   

const resetPassword = async (req, res) => {
    try{
        if (!req.params.token) return next(new appError('No email confirmation token found.'));

        if (!req.body.password) return next(new appError('No email confirmation token found.'));
        
        const user = await User.findOne({forgotPasswordToken: req.params.token});
        if (!user) res.status(400).send("User not found");

        
        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        user.password= hashedPass;  
        user.forgotPasswordToken=undefined;
        user.forgotPasswordTokenExpiry=undefined;

        await user.save();
        res.status(200).json({
            status: 'Success',
            message: "password reset successfully"
        });
    }
    catch(err)
    {
        throw new appError(`There was an error in sending forgot password token. ${err}`, 400);
    }
};




/////////////////////////   sign in with facebook   /////////////////////////   

const facebookCallback = async (req,res) => {
    res.redirect('/home');
}
// const loginWithFacebook = async (req, res) => {
    
//     const token = signToken(req.user._id);

//     res.status(200).json({
//         status: 'Success',
//         success: true,
//         expireDate: process.env.JWT_EXPIRE,
//         token
//         });
// };




/////////////////////////   sign in with google   /////////////////////////   
const googleCallback = async (req,res) => {
    res.json("done");
}


// const loginWithGoogle = async (req, res) => {
    
//     const token = signToken(req.user._id);

//     res.status(200).json({
//         status: 'Success',
//         success: true,
//         expireDate: process.env.JWT_EXPIRE,
//         token
//         });
// };




module.exports = {signUp, login, verification, forgotPassword, resetPassword, facebookCallback, googleCallback};