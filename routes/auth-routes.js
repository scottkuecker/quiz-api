const auth = require('./../controllers/auth');

const router = require('express').Router();



router.get('/signup', auth.signUp);
router.get('/login', auth.login);



module.exports = router;