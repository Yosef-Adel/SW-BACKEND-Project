const ticketController = require('../controllers/ticketController');
const express = require('express');
const authorization = require('../middleware/authorization');
const ticketRouter = express.Router();

//post request to create a new order
ticketRouter.post('/:event_id', authorization, ticketController.createTicket);


module.exports = ticketRouter;