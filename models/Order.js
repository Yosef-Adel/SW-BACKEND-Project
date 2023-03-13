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
        number:{
            type: Number,
            required: true
        },
        ticketClass:{
            type: Schema.Types.ObjectId,
            ref: 'ticket'
        }
    }],

    fees:{
        priceBeforeDiscount:{
            type: Number,
            required: true
        },
        discountAmount:{
            type: Number,
            required: true
        }
    }
})

module.exports = Order = mongoose.model('order', OrderSchema);