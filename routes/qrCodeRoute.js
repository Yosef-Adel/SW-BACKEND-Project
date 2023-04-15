const qrCodeController = require('../controllers/qrCodeController');
const express = require('express');
const authorization = require('../middleware/authorization');
const qrCodeRouter = express.Router();

//just a test to make sure the qr code is generated and sent
//the function inside is then changed to be used in place order
//don't try this route again
qrCodeRouter.post('/testQrCode', authorization, qrCodeController.generateQRCodeAndSendEmail);


module.exports=qrCodeRouter;