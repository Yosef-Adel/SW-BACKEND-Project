const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromocodeSchema = new Schema({
    
    event: {
        type: Schema.Types.ObjectId,
        ref: 'event'
    },

    name: {
        type: String,
        required: true
    },

    tickets:[{
        type: Schema.Types.ObjectId,
        ref: 'ticket'
    }],

    //the percent off the single ticket price
    percentOff: {
        type: Number,
        required: false
    },
    amountOff: {
        type: Number,
        required: false
    },

    //the number of times the promocode can be used
    limit: {
        type: Number,
        required: false
    },

    //the number of times the promocode has been used
    used: {
        type: Number,
        required: false
    },

    startDate: {
        type: Date,
        required: false
    },
    
    endDate: {
        type: Date,
        required: false
    }
}, {timestamps: true})

module.exports = Promocode = mongoose.model('promocode', PromocodeSchema);