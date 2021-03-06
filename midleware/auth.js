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

exports.socketMiddleware = (socket, data, fn) =>{
    const authHeader = data.Authorization;
    if (authHeader) {
        const token = authHeader;
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SIGNING_SECRET)
        }
        catch (e) {
            socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED() })
            return null;
        }
        if (!decodedToken) {
            socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED() })
            return null;
        }
        data.data = decodedToken.user;
        return fn(socket, data)

    } else {
        socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED()})
        return null;
    }
}