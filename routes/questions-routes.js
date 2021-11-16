const questions = require('./../controllers/questions');

const router = require('express').Router();



router.get('/question', questions.getQuestion);



module.exports = router;