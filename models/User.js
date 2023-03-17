//const { uniqueId } = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const validator = require('validator');



const userSchema = new Schema({

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
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

    verifyEmailTokenExpiry: Date,

    password: {
        type: String,
        required: true
    },

    resetPasswordToken: String,
    
    resetPasswordTokenExpiry: Date,

    isCreator:{
        type:Boolean,
        required:false,
        default: false
    },

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

userSchema.methods.generateEmailVerificationToken = async function () {
    let verifyToken;
    let flag = false;
    while(!flag) {
        //generate token
        verifyToken = crypto.randomBytes(32).toString('hex');
        this.verifyEmailToken = crypto.createHash('sha256').update(verifyToken).digest('hex');

        //check if it exists before
        const isUnique = await this.model('users').find({
            verifyEmailToken: this.verifyEmailToken
        });

        //if unique, break
        if(isUnique.length === 0) {
            flag = 1;
        }
    }

    this.verifyEmailTokenExpiry= process.env.JWT_EXPIRE;
    await this.save({
      validateBeforeSave: false
    });
    
    return verifyToken;
};



userSchema.methods.generateForgotPasswordToken = async (req,res)=>{
    let resetPasswordToken;
    let flag = false;
    while (!flag)
    {
        resetPasswordToken=crypto.randomBytes(32).toString('hex');
        this.passwordResetToken= crypto.createHash('sha256').update(resetPasswordToken).digest('hex');

        const isUnique=await this.modelName('users').find({ passwordResetToken: this.passwordResetToken});
        if (!isUnique){
            flag=1;
        }
    }
    this.passwordResetTokenExpiry= process.env.JWT_EXPIRE;

    await this.save({
        validateBeforeSave: false
      });

    return resetPasswordToken;
}

module.exports = User = mongoose.model('users', userSchema);