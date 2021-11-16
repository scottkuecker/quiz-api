const auth = require('./../controllers/auth');

const router = require('express').Router();



router.post('/signup', auth.postSignUp);
router.get('/login', auth.postSignUp);



module.exports = router;