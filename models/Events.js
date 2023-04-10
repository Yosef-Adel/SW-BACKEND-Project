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

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    price :{
        type: Number,
        required: false,
        default: 0
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
    
    // createdBy:{
    //     type: Schema.Types.ObjectId,
    //     ref: 'user',
    //     required: true
    // },

    isPrivate: {
        type: Boolean,
        default: false
    },

    publishDate: {
        type: Date,
        required: false
    },

    password: {
        type: String
    },

    qrCode: {
        type: String,
        required: false
    },

    venueName: {
        type: String,
        required: true
    },
    
    venueCapacity: {
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

module.exports = Event = mongoose.model('event', EventSchema);