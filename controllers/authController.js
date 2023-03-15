const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const password = "Admin@123";


bcrypt.genSalt(saltRounds)
  .then(salt => {
    console.log('Salt: ', salt);
    return bcrypt.hash(password, salt)
  }).then(hash => {
    console.log('Hash: ', hash);
  }).catch(err => console.error(err.message));



const signUp= async (req, res) => {
    try{
        const user = await User.create({
            emailAddress: req.body.emailAddress,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password
        });
        console.log('user created', user);

        if (!(user.emailAddress && user.password && user.firstName && user.lastName)) 
        {
            res.status(400).send("Please fill all the required inputs.");
        }

        const hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        user.password= hashedPass;      
        return res.json(user);
    }

    catch (err)
    {
        return res.status(400).json({message: err.message});
    }
};


const logIn= async (req, res) => {
    try {
        if (req.body.emailAddress){
            const user = await User.findOne({emailAddress: req.body.emailAddress});

            if (!user)
            {
                throw new Error("User is not found");
            }
            
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (isMatch) 
            {
                throw new Error("Password is incorrect");
            }

            const token = await user.generateAuthToken();
            
            console.log("user logged-in", user);

            return res.json({token, user});
        }
    }

    catch(err){
        return res.status(400).json({message: err.message});
    }
};


module.exports = {signUp, logIn};