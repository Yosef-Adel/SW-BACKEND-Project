const userController = require('../controllers/userController');
const express = require('express');
const authorization = require('../middleware/authorization');
const router = express.Router();

router.get('/:id', authorization, userController.getUser);
router.get('/to-creator/:id', authorization,userController.changeToCreator);
router.get('/to-attendee/:id', authorization, userController.changeToAttendee);

router.put('/edit/:id', authorization, userController.editInfo);



//just a test for the authorization middleware
//the user must be logged in to access this route
//the token is in the header of the request (authorization)
router.get('/test-auth', authorization, userController.testAuthorization);

module.exports = router;
