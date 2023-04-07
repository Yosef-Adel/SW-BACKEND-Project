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


exports.getUser = async(req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user){
            return res.status(400).json({message: "User not found"});
        }

        return res.status(200).json(user);
    }

    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in getting user"});
    }
};

exports.editInfo = async(req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user){
            return res.status(400).json({message: "User not found"});
        }

        const updates = Object.keys(req.body);

        updates.forEach((element) => (user[element] = req.body[element]));
        
        await user.save();
        return res.status(200).json(user);

    }
    
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in editing user info"});
    }
}

exports.changeToCreator = async(req,res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user){
            return res.status(400).json({message: "User not found"})
        }
        user.isCreator=true;
        await user.save();
        
        return res.status(200).json(user);
    }
    
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in changing view"})
    }
}


exports.changeToAttendee = async(req,res) => {
    try{
        const user = await User.findById(req.params.id);
        if (!user){
            return res.status(400).json({message: "User not found"})
        }
        user.isCreator=false;
        await user.save();
        
        return res.status(200).json(user);
    }
    
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in changing view"})
    }
}