const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
exports.test = (req, res) => {
    res.json({ msg: 'Users Works' });
}

// @route   POST api/users/register
// @desc    Register user
// @access  Public
exports.register = (req, res) => {
    return res.json({ msg: 'Register Works' });
}

