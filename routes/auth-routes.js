const auth = require('./../controllers/auth');
const middleware = require('../midleware/auth');

const router = require('express').Router();



router.post('/signup', auth.signUp);
router.post('/login', auth.login);
router.post('/autologin', middleware.authMidleware, auth.autoLogin);
router.post('/refresh', middleware.authMidleware, auth.refreshUser);



module.exports = router;