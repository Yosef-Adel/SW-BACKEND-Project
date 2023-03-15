const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizerSchema = new Schema({

    organization: {
        type: Schema.Types.ObjectId,
        ref: 'organization'
    },
    
    name:{
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
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