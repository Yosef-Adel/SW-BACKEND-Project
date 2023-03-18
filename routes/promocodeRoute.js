const promocodeController = require('../controllers/promocodeController');
const express = require('express');
const authorization = require('../middleware/authorization');
const promocodeRouter = express.Router();

//post request to create a new order
promocodeRouter.post('/:event_id', authorization, promocodeController.createPromocode);


module.exports = promocodeRouter;