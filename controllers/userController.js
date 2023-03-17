const User = require('../models/User');


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

