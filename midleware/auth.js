const jwt = require('jsonwebtoken');
const environment = require('../environment');

exports.authMidleware = (req, res,next) =>{
    console.log('middleware')
    const authHeader = req.get('Authorization')
    if(authHeader){
        const token = req.get('Authorization').split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, environment.signingSecret)
        }
        catch (e) {
            err.statusCode = 500;
            throw err;
        }
        if (!decodedToken) {
            const error = new Error('Not authenticated.')
            error.statusCode = 401;
            throw error;
        }
        req.user = decodedToken.user;
        next();
    }else{
        const error = new Error('Not token provided.')
        error.statusCode = 401;
        throw error;
    }
   
}