const orderController = require('../controllers/orderController');
const express = require('express');
const authorization = require('../middleware/authorization');
const orderRouter = express.Router();

//post request to create a new order
orderRouter.post('/:event_id', authorization,orderController.createOrder);
orderRouter.get('/event/:event_id', authorization,orderController.getOrdersByEventId);
orderRouter.get('/orderById/:event_id/:order_id', authorization,orderController.getOrderById);
orderRouter.get('/user/:user_id', authorization,orderController.getOrdersByUserId);
orderRouter.delete('/user/:user_id/:order_id/cancelOrder', authorization,orderController.cancelOrder);

module.exports = orderRouter;