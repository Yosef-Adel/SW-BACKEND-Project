const eventController = require('../controllers/eventController');
const express = require('express');
const router = express.Router();

router.get('/', eventController.getAll);
router.get('/:id', eventController.getById);
router.post('/', eventController.create);
router.put('/:id', eventController.update);

module.exports = router;