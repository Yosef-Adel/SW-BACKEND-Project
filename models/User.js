//const { uniqueId } = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
const jwt = require('jsonwebtoken');



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

    password: {
        type: String,
        required: true
    },

    isVerified: {
        type: Boolean,
        required: false
    },

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


module.exports = User = mongoose.model('users', userSchema);