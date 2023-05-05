const userController = require('../controllers/userController');
const express = require('express');
const authorization = require('../middleware/authorization');
const userRouter = express.Router();

userRouter.get('/:id', authorization, userController.getUser);
userRouter.get('/to-creator/:id', authorization, userController.changeToCreator);
userRouter.get('/to-attendee/:id', authorization, userController.changeToAttendee);

userRouter.put('/edit/:id', authorization, userController.editInfo);

userRouter.delete('/delete/:id', authorization, userController.deleteUser);






//just a test for the authorization middleware
//the user must be logged in to access this route
//the token is in the header of the request (authorization)
userRouter.get('/test-auth', authorization, userController.testAuthorization);

module.exports = userRouter;
