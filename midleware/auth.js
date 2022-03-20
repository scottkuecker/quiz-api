const jwt = require('jsonwebtoken');
const ErrorDB = require('../db_models/errors');
const EVENTS = require('../controllers/socket-events');

exports.authMidleware = async (req, res,next) =>{
    const authHeader = req.get('Authorization')
    if(authHeader){
        const token = req.get('Authorization').split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SIGNING_SECRET)
        }
        catch (e) {
            return res.json({
                sucess: false,
                data: undefined,
                error: 'Authorization failed or missing tokken'
            })
        }
        if (!decodedToken) {
            return res.json({
                sucess: false,
                data: undefined,
                error: 'Authorization failed'
            })
        }
        req.user = decodedToken.user;
        if(req.user){
            next();
        }else{
            console.log('no next')
            return res.json({
                sucess: false,
                data: undefined,
                error: 'User not logged in'
            })
        }
        
    }else{
       return res.json({
            sucess: false,
            data: undefined,
            error: 'User not logged in'
        })
    }
   
}

exports.socketMidleware = async (data) =>{
    const authHeader = data.Authorization;
    if(authHeader){
        const token = authHeader.split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SIGNING_SECRET)
        }
        catch (e) {
           return null;
        }
        if (!decodedToken) {
            return null;
        }
        return decodedToken.user
        
    }else{
       return null;
    }
   
}