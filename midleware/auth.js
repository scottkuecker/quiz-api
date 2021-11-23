const jwt = require('jsonwebtoken');
const environment = require('../environment');

exports.authMidleware = (req, res,next) =>{
    const authHeader = req.get('Authorization')
    if(authHeader){
        const token = req.get('Authorization').split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, environment.signingSecret)
        }
        catch (e) {
            return res.json({
                sucess: false,
                error: 'Authorization failed or missing tokken'
            })
        }
        if (!decodedToken) {
            return res.json({
                sucess: false,
                error: 'Authorization failed'
            })
        }
        req.user = decodedToken.user;
        next();
    }else{
       return res.json({
            sucess: false,
            error: 'User not logged in'
        })
    }
   
}