const eventController = require('../controllers/eventController');
const express = require('express');
const router = express.Router();

router.get('/', eventController.getAll);
router.get('/nearest', eventController.getNearest);
router.get('/search', eventController.search);
router.get('/:id', eventController.getById);
router.get('/:userId/all-events', eventController.getUserEvents);
router.get('/:userId/past-events', eventController.getUserPastEvents);
router.get('/:userId/upcoming-events', eventController.getUserUpcomingEvents);

router.post('/', eventController.create);

router.put('/:id', eventController.update);

router.delete('/:id', eventController.delete);

module.exports = router;