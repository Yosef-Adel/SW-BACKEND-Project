const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');


const UserSchema = new Schema({

    name:{

        firstName: {
            type: String,
            required: true
        },
    
        lastName: {
            type: String,
            required: true
        }

    },

    email:{

        emailAddress: {
            type: String,
            required: true,
            unique: true
        },
    
        isVerified: {
            type: Boolean,
            default: false
        }

    },

    password: {
        type: String,
        required: true
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

    phone:{
        cellPhone: {
            type: String,
            required: false
        },
    
        workPhone: {
            type: String,
            required: false
        }
    },

    address:{
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

    }

})
UserSchema.plugin(uniqueValidator);


module.exports = User = mongoose.model('users', UserSchema);