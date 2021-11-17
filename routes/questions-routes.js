const questions = require('./../controllers/questions');
const authMiddleware = require('../midleware/auth');

const router = require('express').Router();



router.get('/question', authMiddleware.authMidleware, questions.getQuestion);



module.exports = router;