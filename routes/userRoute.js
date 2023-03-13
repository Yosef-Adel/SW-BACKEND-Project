const userController = require('../controllers/userController');
const express = require('express');
const router = express.Router();

router.get('/', userController.test);
router.post('/', userController.register);

module.exports = router;
