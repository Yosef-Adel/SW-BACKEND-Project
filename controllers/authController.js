const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const sendMail = require('../utils/emailVerification');
const crypto = require('crypto');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const saltRounds = 10;
const password = "Admin@123";

bcrypt.genSalt(saltRounds)
  .then(salt => {
    console.log('Salt: ', salt);
    return bcrypt.hash(password, salt)
  }).then(hash => {
    console.log('Hash: ', hash);
  }).catch(err => console.error(err.message));

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })};


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
        const verifyEmailText = "Please click on the button to complete the verification process."
    
        await sendMail({
        email: user.emailAddress,
        subject: `Verify your email address with Eventbrite`,
        message: verifyEmailText
        });
        await user.save();

        return res.json("check your email for verification",user);
    }
    
    catch (err) {
        return res.status(400).json({ message: err.message });
      }
};


const verification = catchAsync(async (req, res, next) => {
    if (!req.params.token)
    return next(new appError('No email confirmation token found.'));

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');


    const user = await User.findOne({verifyEmailToken: hashedToken} );
    if (!user) return next(new appError(`Token is invalid or has expired`, 400));

    user.verifyEmailToken = undefined;
    user.isVerified = true;
    await user.save();
    
    const token = signToken(user._id);

    res.status(200).json({
        status: 'Success',
        success: true,
        expireDate: process.env.JWT_EXPIRE,
        token
      });  
})


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

const forgotPassword = async (req, res) => {
    await sendForgotPasswordToken(req.body.emailAddress);
  
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
}

const sendForgotPasswordToken = async emailAddress => {
    const user = await User.find({emailAddress});

    if (!user)
    {
        console.log('Email not found');
    }

    const forgotPasswordToken = user.generateForgotPasswordToken();

    const forgotPasswordEmailText = "We received a request to reset your password for your Eventbrite account. We received a request to reset your password for your Eventbrite account.";

    try{
        await sendMail({
            email: user.emailAddress,
            subject: 'We received a request to reset your password for your Eventbrite account',
            message:forgotPasswordEmailText
        });
    }
    catch (err){
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;

        await User.save({
            validateBeforeSave: false
          });
        
        throw new appError(`There was an error in sending forgot password token. ${err}`, 400);
    }
    
};


// const loginWithFacebookOrGoogle = async (req, res) => {
    
//     const token = signToken(req.user._id);

//     res.status(200).json({
//       status: 'Success',
//       success: true,
//       expireDate: process.env.JWT_EXPIRE,
//       token
//       });
//   };



module.exports = {signUp, login, verification, forgotPassword};
