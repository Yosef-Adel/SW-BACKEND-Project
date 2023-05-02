const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');
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
    },

    organization: {
        type: Schema.Types.ObjectId,
        ref: 'organization'
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


module.exports = User = mongoose.model('users', userSchema);