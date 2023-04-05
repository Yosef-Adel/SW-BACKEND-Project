const ticketController = require('../controllers/ticketController');
const express = require('express');
const authorization = require('../middleware/authorization');
const ticketRouter = express.Router();

//post request to create a new order
ticketRouter.post('/:event_id/createTicket', authorization, ticketController.createTicket);
ticketRouter.get('/:event_id/:ticket_id/getTicketById', authorization, ticketController.getTicketById);
ticketRouter.delete('/:event_id/:ticket_id/deleteTicketById', authorization, ticketController.deleteTicketById);
ticketRouter.get('/:event_id/allTickets', authorization, ticketController.getAllTicketsByEventId);
ticketRouter.put('/:event_id/:ticket_id', authorization, ticketController.editTicketById);
ticketRouter.get('/:event_id/availableTickets', authorization, ticketController.getAvailableTicketsByEventId);



module.exports = ticketRouter;