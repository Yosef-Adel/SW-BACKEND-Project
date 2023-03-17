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

    // numberOfTicketsBought:{
    //     type: Number,
    //     required: true
    // },

    // ticketClassBought:{
    //     type: Schema.Types.ObjectId,
    //     ref: 'ticket'
    // },
    ticketsBought:[{
        ticketClass:{
            type: Schema.Types.ObjectId,
            ref: 'ticket'
        },
        number:{
            type: Number,
            required: true
        }
    }],

    // the subtotal is the sum of the price of each ticket bought
    subTotal:{
        type: Number,
        required: true
    },

    //the added fee to the subtotal
    fees:{
        type: Number,
        required: true
    },

    //the discount amount of the promocode
    discountAmount:{
        type: Number,
        required: true
    },
    

    //total amount to be paid
    //which is the subtotal + fees - discountAmount
    total:{
        type: Number,
        required: true
    }

}, {timestamps: true})

module.exports = Order = mongoose.model('order', OrderSchema);