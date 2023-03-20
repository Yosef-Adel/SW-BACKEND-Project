const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');
//const passport = require("../config/passport");



authRouter.post('/sign-up', authController.signUp);
authRouter.post('/login', authController.login);

authRouter.post('/forgot-password', authController.forgotPassword);

authRouter.patch('/reset-password/:token', authController.resetPassword);

authRouter.get('/sign-up-verify/:token', authController.verification);

//authRouter.post('/facebook', passport.authenticate('facebook-token', { session: false }), authController.loginWithFacebook);
//authRouter.post('/google', passport.authenticate('facebook-token', { session: false }), authController.loginWithGoogle)

module.exports = authRouter;