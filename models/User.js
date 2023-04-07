const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const Schema = mongoose.Schema;

const userSchema = new Schema({

    firstName: {
        type: String,
        required: false
    },

    lastName: {
        type: String,
        required: false
    },

    emailAddress: {
        type: String,
        required: true,
        unique: true
    },

    isVerified: {
        type: Boolean,
        required: false,
        default: false
    },

    verifyEmailToken: String,

    password: {
        type: String,
        required: false
    },
    

    forgotPasswordToken: String,

    isCreator:{
        type:Boolean,
        required:false,
        default: false
    },

    facebookID: String,
    googleID: String,

    prefix: {
        type: String,
        required: false
    },

    gender: {
        type: String,
        required: false
    },

    jobTitle: {
        type: String,
        required: false
    },

    company: {
        type: String,
        required: false
    },

    cellPhone: {
        type: String,
        required: false
    },

    workPhone: {
        type: String,
        required: false
    },

    homeAddress: {
        type: String,
        required: false
    },

    workAddress: {
        type: String,
        required: false
    },

    shippingAddress: {
        type: String,
        required: false
    }

}, {timestamps: true});


userSchema.plugin(uniqueValidator);


userSchema.methods.generateAuthToken = async function() {
    const user= this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_KEY, {
        expiresIn: "24h"
    });
    return token;
};

userSchema.methods.generateEmailVerificationToken = async function() {
    const user= this;
    const verifyToken = jwt.sign({_id: user._id.toString()}, process.env.JWT_KEY, {
        expiresIn: "24h"
    });
    this.verifyEmailToken=verifyToken;
    
    return verifyToken;
};


userSchema.methods.generateForgotPasswordToken = async function() {
    const user= this;
    const passwordToken = jwt.sign({_id: user._id.toString()}, process.env.JWT_KEY, {
        expiresIn: "24h"
    });
    this.forgotPasswordToken=passwordToken;
    
    return passwordToken;
};

// userSchema.methods.generateEmailVerificationToken = async function() {
//     let verifyToken;
//     let flag = false;
//     while(!flag) {
//         //generate token
//         verifyToken = crypto.randomBytes(32).toString('hex');
//         this.verifyEmailToken = crypto.createHash('sha256').update(verifyToken).digest('hex');

//         //check if it exists before
//         const isUnique = await this.model('users').find({
//             verifyEmailToken: this.verifyEmailToken
//         });

//         //if unique, break
//         if(isUnique.length === 0) {
//             flag = 1;
//         }
//     }

//     this.verifyEmailTokenExpiry= process.env.JWT_EXPIRE;
//     await this.save({
//         validateBeforeSave: false
//     });
    
//     return verifyToken;
// };


// userSchema.methods.generateForgotPasswordToken = async function() {
//     let passwordToken;
//     let flag = false;
//     console.log("flag in forgot password=", flag)
//     while(!flag) {
//         //generate token
//         passwordToken = crypto.randomBytes(32).toString('hex');
//         this.forgotPasswordToken = crypto.createHash('sha256').update(passwordToken).digest('hex');

//         //check if it exists before
//         const isUnique = await this.model('users').find({
//             forgotPasswordToken: this.forgotPasswordToken
//         }); 

//         //if unique, break
//         if(isUnique.length === 0) {
//             flag = 1;
//         }
//     }

//     this.forgotPasswordTokenExpiry= process.env.JWT_EXPIRE;
//     await this.save({
//         validateBeforeSave: false
//     });
    
//     return passwordToken;
// };


module.exports = User = mongoose.model('users', userSchema);