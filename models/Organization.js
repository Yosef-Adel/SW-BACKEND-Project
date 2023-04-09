const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: false
    },

    image: {
        type: String,
        required: false
    },

    createdBy:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

    organizers: [{
        type: Schema.Types.ObjectId,
        ref: 'organizer',
        default: []
    }]
}, {timestamps: true})

module.exports = Organization = mongoose.model('organization', OrganizationSchema);
