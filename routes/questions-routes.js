const questions = require('./../controllers/questions');
const authMiddleware = require('../midleware/auth');

const router = require('express').Router();



router.get('/question', questions.getQuestion);



module.exports = router;