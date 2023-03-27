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


//a test to check if the user is authorized
//the user must be logged in to access this route
//the route should have all the user info in the request
exports.testAuthorization = (req, res) => {
    res.json({
        msg: 'The user is authorized ',
        user: req.user,
        isCreator: req.isCreator
    });
}


