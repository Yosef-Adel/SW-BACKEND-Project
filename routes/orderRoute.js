const orderController = require('../controllers/orderController');
const express = require('express');
const authorization = require('../middleware/authorization');
const orderRouter = express.Router();

//post request to create a new order
orderRouter.post('/:event_id', authorization,orderController.createOrder);


module.exports = orderRouter;