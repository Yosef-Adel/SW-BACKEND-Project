const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VenueSchema = new Schema({
    event: {
        type: Schema.Types.ObjectId,
        ref: 'event'
    },
    name: {
        type: String,
        required: true
    },

    capacity: {
        type: Number,
        required: false
    },

    city: {
        type: String,
        required: true
    },

    address1: {
        type: String,
        required: true
    },

    address2: {
        type: String,
        required: false
    },

    state: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },

    longitude: {
        type: Number,
        required: false
    },

    latitude: {
        type: Number,
        required: false
    }

}, {timestamps: true})

module.exports = Venue = mongoose.model('venue', VenueSchema);