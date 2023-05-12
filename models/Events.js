const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EventSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: false
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
        //-1 means that the event price is undefined
        //will be defined by the minimum ticket price
        default:-1
    },
    
    summary: {
        type: String,
        required: false
    },

    capacity: {
        type: Number,
        required: false,
        // put the default capacity to 0
        // 0 means that the event capacity is undefined
        //will be updated if the creator updated the capacity or added tickets
        default: 0
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
        ref: 'organizer',
        required: false
    },
    
    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: false
    },

    isPrivate: {
        type: Boolean,
        default: false
    },
    
    isScheduled:{
        type: Boolean, 
        default: false
    },

    isPublished: {
        type: Boolean,
        default: false
    },

    publishDate: {
        type: Date,
        required: false
    },

    password: {
        type: String,
        required: false
    },

    qrCode: {
        type: String,
        required: false
    },

    venueName: {
        type: String,
        required: false
    },
    
    venueCapacity: {
        type: Number,
        required: false
    },

    city: {
        type: String,
        required: false
    },

    address1: {
        type: String,
        required: false
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
        required: false
    },
    postalCode: {
        type: String,
        required: false
    },

    longitude: {
        type: Number,
        required: false
    },

    latitude: {
        type: Number,
        required: false
    },

    isOnline: {
        type: Boolean,
        required: false,
        default: false
    },

}, {timestamps: true})

module.exports = Event = mongoose.model('event', EventSchema);