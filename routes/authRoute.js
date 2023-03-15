const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');

/////////// post requests ///////////
authRouter.post('/sign-up', authController.signUp);

authRouter.post('/log-in', authController.logIn);



module.exports = authRouter;