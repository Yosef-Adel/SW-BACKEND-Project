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
    
    //free or paid
    type:{
        type: String,
        required: true
    },

    price:{
        type: Number,
        required: true
    },

    //fee is the fee per ticket 
    //and it has a standard equation of calculation
    //fee per ticket= (ticketPrice * 0.037)+(1.79)+(ticketPrice * 0.029)
    fee:{
        type: Number,
        required: true
    },

    capacity:{
        type: Number,
        required: true
    },
    
    sold:{
        type: Number,
        required: false,
        default: 0
    },

    // minQuantityPerOrder:{
    //     type: Number,
    //     required: true
    // },
    
    // maxQuantityPerOrder:{
    //     type: Number,
    //     required: true
    // },

    salesStart:{
        type: Date,
        required: true
    },
    salesEnd:{
        type: Date,
        required: true
    },

    description:{
        type: String,
        required: false
    }

}, {timestamps: true})

module.exports = Ticket = mongoose.model('ticket', TicketSchema);