const auth = require('./../controllers/auth');
const middleware = require('../midleware/auth');
const handler = require('../utils/errorHandler');

const router = require('express').Router();

router.post('/signup', auth.signUp);
router.post('/login', auth.login);
router.post('/facebook-login', auth.facebookLogin);



module.exports = router;
