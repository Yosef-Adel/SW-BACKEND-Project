const ticketController = require('../controllers/ticketController');
const express = require('express');
const authorization = require('../middleware/authorization');
const ticketRouter = express.Router();

//post request to create a new order
ticketRouter.post('/:event_id', authorization, ticketController.createTicket);
ticketRouter.get('/:event_id/:ticket_id', authorization, ticketController.getTicketById);
ticketRouter.delete('/:event_id/:ticket_id', authorization, ticketController.deleteTicketById);
ticketRouter.get('/:event_id', authorization, ticketController.getTicketsByEventId);
ticketRouter.put('/:event_id/:ticket_id', authorization, ticketController.editTicketById);



module.exports = ticketRouter;