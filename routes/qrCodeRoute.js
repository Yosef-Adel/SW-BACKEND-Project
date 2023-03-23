const qrCodeController = require('../controllers/qrCodeController');
const express = require('express');
const authorization = require('../middleware/authorization');
const qrCodeRouter = express.Router();

qrCodeRouter.post('/testQrCode', authorization, qrCodeController.generateQRCodeAndSendEmail);


module.exports=qrCodeRouter;