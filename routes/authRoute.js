const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');



authRouter.post('/sign-up', authController.signUp);
authRouter.post('/login', authController.login);

//authRouter.post('/forgot-password', authController.forgotPassword);

//authRouter.patch('/reset-password/:token', authController.resetPassword);

//authRouter.get('/sign-up-verify/:token', authController.verification);



module.exports = authRouter;