const auth = require('./../controllers/auth');
const middleware = require('../midleware/auth');
const handler = require('../utils/errorHandler');

const router = require('express').Router();



router.post('/signup', handler.handleError(auth.signUp));
router.post('/login', handler.handleError(auth.login));
router.post('/autologin', handler.handleError(middleware.authMidleware), handler.handleError(auth.autoLogin));
router.post('/facebook-login', handler.handleError(auth.facebookLogin));
router.post('/refresh', handler.handleError(middleware.authMidleware), handler.handleError(auth.refreshUser));



module.exports = router;