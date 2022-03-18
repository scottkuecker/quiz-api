const auth = require('./../controllers/auth');
const middleware = require('../midleware/auth');
const handler = require('../utils/errorHandler');

const cors = require("cors");
const router = require('express').Router();



router.post('/signup', auth.signUp);
router.post('/login', cors(), auth.login);
router.post('/autologin',cors(), middleware.authMidleware, auth.autoLogin);
router.post('/facebook-login', auth.facebookLogin);
router.post('/refresh', cors(), middleware.authMidleware, auth.refreshUser);



module.exports = router;
