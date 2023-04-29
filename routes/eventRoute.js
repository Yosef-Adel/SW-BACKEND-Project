const eventController = require('../controllers/eventController');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinaryStorage = require("../config/cloudinary");
const authorization = require('../middleware/authorization');
const upload = new multer({storage: cloudinaryStorage.storage});


router.get('/', eventController.getAll);
router.get('/all-events', eventController.getAllEvents);
router.get('/nearest', eventController.getNearest);
router.get('/search', eventController.search);
router.get('/:id', eventController.getById);


router.get('/:userId/all-events', authorization, authorization, eventController.getUserEvents);
router.get('/:userId/all-events/download', eventController.downloadUserEvents);
router.get('/:userId/past-events', authorization, authorization, eventController.getUserPastEvents);
router.get('/:userId/upcoming-events', authorization, authorization, eventController.getUserUpcomingEvents);

router.post('/',  [upload.single("image"),authorization], eventController.create);

router.put('/:id', upload.single("image"), authorization, eventController.update);

router.delete('/:id', authorization, eventController.delete);

router.get('/:id/attendees',authorization,  eventController.getAttendees);
router.post('/:id/attendees', authorization, eventController.addAttendee);
// router.delete('/:id/attendees/:attendeeId', eventController.removeAttendee);


router.get('/:eventId/getAttendeeReport',authorization, eventController.getAttendeeReport);
router.get('/:eventId/getAttendeeReport/download',authorization, eventController.downloadAttendeeReport);
router.get('/:eventId/getSalesByTicketTypeReport',authorization, eventController.getSalesByTicketTypeReport);
router.get('/:eventId/getOrderSummaryReport',authorization, eventController.getOrderSummaryReport);
router.get('/:eventId/getEventUrl',authorization, eventController.getEventUrl);
router.get('/:eventId/getTicketsSoldForEvent',authorization, eventController.getTicketsSoldForEvent);
router.get('/:eventId/getSalesByTicketTypeDashboard',authorization, eventController.getSalesByTicketTypeDashboard);
router.get('/:eventId/getOrderSummaryReportMostRecent',authorization, eventController.getOrderSummaryReportMostRecent);

module.exports = router;