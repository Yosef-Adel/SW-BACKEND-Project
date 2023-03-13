const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    country: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true
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
})

module.exports = Organization = mongoose.model('organization', OrganizationSchema);
