const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({

    event: {
        type: Schema.Types.ObjectId,
        ref: 'event'
    },
    
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

    numberOfTicketsBought:{
        type: Number,
        required: true
    },
    ticketClassBought:{
        type: Schema.Types.ObjectId,
        ref: 'ticket'
    },

    priceBeforeDiscount:{
        type: Number,
        required: true
    },
    discountAmount:{
        type: Number,
        required: true
    }
}, {timestamps: true})

module.exports = Order = mongoose.model('order', OrderSchema);