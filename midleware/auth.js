const jwt = require('jsonwebtoken');

exports.authMidleware = (req, res,next) =>{
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
exports.headers = (req, res, next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}