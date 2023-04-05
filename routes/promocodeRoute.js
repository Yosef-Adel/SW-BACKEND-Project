const promocodeController = require('../controllers/promocodeController');
const express = require('express');
const authorization = require('../middleware/authorization');
const promocodeRouter = express.Router();

//post request to create a new order
promocodeRouter.post('/:event_id', authorization, promocodeController.createPromocode);
promocodeRouter.get('/:event_id/:promo_id', authorization, promocodeController.getPromocode);
promocodeRouter.put('/:event_id/:promo_id', authorization, promocodeController.updatePromocode);
promocodeRouter.delete('/:event_id/:promo_id', authorization, promocodeController.deletePromocode);
promocodeRouter.get('/:event_id', authorization, promocodeController.getPromocodes);



module.exports = promocodeRouter;