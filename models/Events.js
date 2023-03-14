const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    created_date: {
        type: Date,
        default: Date.now
    },


    summary: {
        type: String,
        required: true
    },

    capacity: {
        type: Number,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    tickets: [{
        type: Schema.Types.ObjectId,
        ref: 'ticket',
        default: []

    }],

    image: {
        type: String,
        required: false
    },

    hostedBy: {
        type: Schema.Types.ObjectId,
        ref: 'organizer'
    },

    qrCode: {
        type: String,
        required: false
    },

    venue: {
        type: Schema.Types.ObjectId,
        ref: 'venue'
    }

})

module.exports = Event = mongoose.model('event', EventSchema);





