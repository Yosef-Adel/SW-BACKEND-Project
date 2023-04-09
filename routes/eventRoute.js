const eventController = require('../controllers/eventController');
const express = require('express');
const router = express.Router();

router.get('/', eventController.getAll);
router.get('/nearest', eventController.getNearest);
router.get('/search', eventController.search);
router.get('/:id', eventController.getById);
router.post('/', eventController.create);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.delete);

router.get('/:id/attendees', eventController.getAttendees);
router.post('/:id/attendees', eventController.addAttendee);
router.delete('/:id/attendees/:attendeeId', eventController.removeAttendee);

module.exports = router;