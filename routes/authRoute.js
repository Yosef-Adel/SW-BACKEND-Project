const express = require('express');
const passport = require('passport');
const authRouter = express.Router();
const authController = require('../controllers/authController');



authRouter.post('/sign-up', authController.signUp);
authRouter.post('/login', authController.login);

authRouter.post('/forgot-password', authController.forgotPassword);

authRouter.patch('/reset-password/:token', authController.resetPassword);

authRouter.get('/sign-up-verify/:token', authController.verification);



authRouter.get('/facebook', passport.authenticate('facebook'));
authRouter.get('/facebook/callback', passport.authenticate('facebook'), authController.facebookCallback);

authRouter.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
authRouter.get('/google/callback', authController.googleCallback);

module.exports = authRouter;