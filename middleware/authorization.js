//a middleware to authorize the user and check for the validity of the token
//the token is in the header of the request
//the token is in the format of Bearer <token>
//If the token exists and is verified, the user is authorized
//and the id of the user is forwarded to the next route
//this will be passed in the controller functions

const jwt = require('jsonwebtoken');

const authorization = async (req, res, next) => {
    let decoded;
        //check if the token exists
        //getting rid of the bearer
        if (req.headers.authorization) {
            const headerToken = req.headers.authorization.split(" ")[1];
            await jwt.verify(headerToken, process.env.JWT_KEY, async (err, decoded) => {
                if (err) {
                    return res.status(401).json({message: 'Your token is invalid, your are not authorized!'});
                }
                    //send the user data to the next route in the response
                    req.user = decoded;

                    //send the isCreator field in the user schema to the next route in the response
                    req.userId = decoded._id;
                    //user the id to find the user in the database
                    await User.findById(req.userId)
                        .then( async user => {
                            if (!user) {
                                return res.status(404).json({
                                    message: "No user found with id " + req.userId
                                });
                            }
                                req.isCreator = user.isCreator;
                        })


                        next();
                });   
        } 
        else {
            return res.status(401).json({message: 'No token provided!'});
        }
            
};

module.exports = authorization;