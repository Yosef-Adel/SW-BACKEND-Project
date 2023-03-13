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

    capacity:{
        regular:{
            type: Number,
            required: true
        },
        onHold:{
            type: Number,
            required: false
        }
    },

    perOrder:{
        minQuantity:{
            type: Number,
            required: true
        },
        maxQuantity:{
            type: Number,
            required: true
        }
    },

    sales:{
        salesStart:{
            type: Date,
            required: true
        },
        salesEnd:{
            type: Date,
            required: true
        },
        status:{
            type: String,
            required: true
        }
    }

})

module.exports = Ticket = mongoose.model('ticket', TicketSchema);