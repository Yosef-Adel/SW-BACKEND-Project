const jwt = require('jsonwebtoken');

exports.verifyToken = (token) =>{
    let valid = true;
    // check if token has expired or not
    jwt.verify(token, process.env.JWT_KEY, async (err) => {
        if (err) {
            valid=false;
        }
    });
    
    return valid;
}