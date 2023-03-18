const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({

    event:{
        type: Schema.Types.ObjectId,
        ref: 'event'
    },
    
    name:{
        type: String,
        required: true
    },

    type:{
        type: String,
        required: true
    },

    price:{
        type: Number,
        required: true
    },

    regularCapacity:{
        type: Number,
        required: true
    },
    onHoldCapacity:{
        type: Number,
        required: false
    },

    minQuantityPerOrder:{
        type: Number,
        required: true
    },
    maxQuantityPerOrder:{
        type: Number,
        required: true
    },

    salesStart:{
        type: Date,
        required: true
    },
    salesEnd:{
        type: Date,
        required: true
    },
    salesStatus:{
        type: String,
        required: true
    }

}, {timestamps: true})

module.exports = Ticket = mongoose.model('ticket', TicketSchema);