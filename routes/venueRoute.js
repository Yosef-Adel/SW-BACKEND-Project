const venueController = require('../controllers/venueController');
const express = require('express');
const authorization = require('../middleware/authorization');
const venueRouter = express.Router();



venueRouter.post('/:event_id', authorization, venueController.createVenue);

module.exports = venueRouter;