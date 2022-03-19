const auth = require('./../controllers/auth');
const middleware = require('../midleware/auth');
const handler = require('../utils/errorHandler');

const router = require('express').Router();

router.post('/signup', auth.signUp);
router.post('/login', auth.login);
router.post('/autologin', middleware.authMidleware, auth.autoLogin);
router.post('/facebook-login', auth.facebookLogin);
router.get('/refresh', middleware.authMidleware, auth.refreshUser);



module.exports = router;
