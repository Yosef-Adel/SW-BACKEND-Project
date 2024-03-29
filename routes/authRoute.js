const express = require('express');
const passport = require('passport');
const authRouter = express.Router();
const authController = require('../controllers/authController');
const authorization = require("../middleware/authorization.js");



authRouter.post('/sign-up', authController.signUp);
authRouter.post('/login', authController.login);
authRouter.post('/forgot-password', authController.forgotPassword);

authRouter.patch('/reset-password/:token', authController.resetPassword);

authRouter.get('/sign-up-verify/:token', authController.verification);
authRouter.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate("google"), authController.googleCallback);

module.exports = authRouter;