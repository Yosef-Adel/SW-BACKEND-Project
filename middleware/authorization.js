//a middleware to authorize the user and check for the validity of the token
//the token is in the header of the request
//the token is in the format of Bearer <token>
//If the token exists and is verified, the user is authorized
//and the id of the user is forwarded to the next route

//this will be passed in the controller functions

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let decodedToken;
    try {
        //getting rid of the bearer 
        const headerToken = req.headers.authorization.split(" ")[1];
        decodedToken = jwt.verify(headerToken, process.env.JWT_KEY);
    } catch (error) {
        error.statusCode = 500; //server error
        throw error;
    }
    if (!decodedToken) {
        const error = new Error('You are not authenticated!');
        error.statusCode = 401; //not authenticated
        throw error;
    }
    //passing the data to the next route
    req.userData = decodedToken;
    //passing the id
    req.userId = decodedToken.userId;
    //I want to pass the role too, 
    //so that the next route knows if the user is an attendee or a creator 
    //isCreator boolean
    req.isCreator = decodedToken.isCreator;

    next();
};
