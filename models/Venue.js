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
        required: true
    },

    city: {
        type: String,
        required: true
    },

    longitude: {
        type: Number,
        required: true
    },

    latitude: {
        type: Number,
        required: true
    }

})

module.exports = Venue = mongoose.model('venue', VenueSchema);