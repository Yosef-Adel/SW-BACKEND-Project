//testing place order
const {createOrder}=require('../controllers/orderController');
const Order = require('../models/Order');
const TicketClass = require('../models/Tickets');
const Event = require('../models/Events');
const Promocode = require('../models/Promocode');