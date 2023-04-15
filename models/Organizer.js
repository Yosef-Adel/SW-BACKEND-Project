const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    url: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    facebookUrl: {
        type: String,
        required: false
    },
    twitterUrl: {
        type: String,
        required: false
    }

}, {timestamps: true})

module.exports = Organizer = mongoose.model('organizer', OrganizerSchema);