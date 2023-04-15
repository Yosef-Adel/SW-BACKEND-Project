const eventController = require('../controllers/eventController');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinaryStorage = require("../config/cloudinary");
const authorization = require('../middleware/authorization');
const upload = new multer({storage: cloudinaryStorage.storage});

//for front/cross teams
router.get('/', eventController.getAll);
router.get('/all-events', eventController.getAllEvents);
router.get('/nearest', eventController.getNearest);
router.get('/search', eventController.search);
router.get('/:id', eventController.getById);
router.get('/:userId/all-events', eventController.getUserEvents);
router.get('/:userId/past-events', eventController.getUserPastEvents);
router.get('/:userId/upcoming-events', eventController.getUserUpcomingEvents);

router.post('/', upload.single("image"), eventController.create);

router.put('/:id', upload.single("image"), eventController.update);

router.delete('/:id', eventController.delete);

router.get('/:id/attendees', eventController.getAttendees);
router.post('/:id/attendees', eventController.addAttendee);
// router.delete('/:id/attendees/:attendeeId', eventController.removeAttendee);


router.get('/:eventId/getAttendeeReport',authorization, eventController.getAttendeeReport);
router.get('/:eventId/getSalesByTicketTypeReport',authorization, eventController.getSalesByTicketTypeReport);
router.get('/:eventId/getOrderSummaryReport',authorization, eventController.getOrderSummaryReport);

module.exports = router;