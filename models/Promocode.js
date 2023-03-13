const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromocodeSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    appliedTo: {
        event: {
            type: Schema.Types.ObjectId,
            ref: 'event'
        },

        tickets:[{
            type: Schema.Types.ObjectId,
            ref: 'ticket'
        }]
    },

    amount: {
        type: Number,
        required: true
    },

    limit: {
        type: Number,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },
    
    endDate: {
        type: Date,
        required: true
    }
})

module.exports = Promocode = mongoose.model('promocode', PromocodeSchema);