const promocodeController = require('../controllers/promocodeController');
const express = require('express');
const cloudinaryStorage = require("../config/cloudinary");
const multer = require('multer');
const authorization = require('../middleware/authorization');
const promocodeRouter = express.Router();
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

//post request to create a new order
promocodeRouter.post('/:event_id', authorization, promocodeController.createPromocode);
promocodeRouter.get('/:event_id/:promo_id/getPromocode', authorization, promocodeController.getPromocode);
promocodeRouter.put('/:event_id/:promo_id', authorization, promocodeController.updatePromocode);
promocodeRouter.delete('/:event_id/:promo_id', authorization, promocodeController.deletePromocode);
promocodeRouter.get('/:event_id', authorization, promocodeController.getPromocodes);
promocodeRouter.get('/:event_id/:promocode_name/checkPromo', promocodeController.checkPromo);
promocodeRouter.get('/:event_id/:promocode_name/checkPromoSecured',authorization ,promocodeController.checkPromoSecured);
promocodeRouter.post('/:event_id/upload',upload.single("file"),authorization, promocodeController.uploadPromocodes);



module.exports = promocodeRouter;