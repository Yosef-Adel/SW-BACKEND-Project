const User = require('../models/User');
const Events = require('../models/Events');
const uploadImage = require("../utils/uploadImage");
const fs = require('fs');


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

        return res.status(200).json({message: "Success", user});
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
        return res.status(200).json({message : "Updated info successfully", user});

    }
    
    catch(err){
        console.log(err.message);
        return res.status(400).json({message: "Error in editing user info"});
    }
}

exports.deleteUser = async(req,res) =>{
    try{
        const user = await User.findById(req.params.id);
        if (!user){
            return res.status(400).json({message: "User not found"});
        }

        await Events.deleteMany({"createdBy": user});
        await User.deleteOne(user);

        return res.status(200).json({message: "User deleted successfully."})

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
        // check if the user is authorized
        if (!req.isCreator){
            return res.status(400).json({message: "You are not a creator"});
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

// exports.changeImage = async(req, res)=>{
//     try{
//         const user = await User.findById(req.params.id);
//         if (!user){
//             return res.status(400).json({message: "User not found"});
//         }
//         user.img.data= fs.readFileSync(path.join(_dirname + '/uploads/' + req.file.filename));
//         user.img.contentType = 'image/png';
        
//         await user.save();

//         return res.status(200).json({message: "image uploaded successfully"});
//     }
//     catch(err){
//         console.log(err.message);
//         return res.status(400).json({message: "Error in changing image"});
//     }
// }

exports.assingNotification = async(req,res) => {
    const registrationToken = req.body.registrationToken
    const userId = req.user._id;
    const user = await User.findById(userId);
    user.firebaseRegistrationToken.push(registrationToken);
    await user.save();
    return res.status(200).json({message: "notification assigned successfully"});
}