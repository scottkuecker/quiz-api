const auth = require('./../controllers/auth');
const middleware = require('../midleware/auth');
const handler = require('../utils/errorHandler');

const router = require('express').Router();

function cors(req,res,next){
  res.header('Access-Control-Allow-Origin', 'https://kviz-live.web.app')
  next();
}


router.post('/signup', auth.signUp);
router.post('/login', cors(), auth.login);
router.post('/autologin',cors(), middleware.authMidleware, auth.autoLogin);
router.post('/facebook-login', auth.facebookLogin);
router.post('/refresh', cors(), middleware.authMidleware, auth.refreshUser);



module.exports = router;
