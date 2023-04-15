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

    promocode:{
        type: Schema.Types.ObjectId,
        ref: 'promocode',
        required: false
    },

    // the subtotal is the sum of the price of each ticket bought
    subTotal:{
        type: Number,
        required: false
    },

    //the added fee to the subtotal
    fees:{
        type: Number,
        required: false
    },

    //the discount amount of the promocode
    discountAmount:{
        type: Number,
        required: false
    },
    
    //total amount to be paid
    //which is the subtotal + fees - discountAmount
    total:{
        type: Number,
        required: false
    },

    //the attendee details of this specific order
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    canceled:{
        type: Boolean,
        required: false,
        default: false
    }

}, {timestamps: true})

module.exports = Order = mongoose.model('order', OrderSchema);