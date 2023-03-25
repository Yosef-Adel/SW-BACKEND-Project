const categoryController = require('../controllers/categoryController');
const express = require('express');
const router = express.Router();

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.get('/:id/events', categoryController.getEvents);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;