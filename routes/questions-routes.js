const questions = require('./../controllers/questions');
const middleware = require('../midleware/auth');

const router = require('express').Router();



router.get('/question',questions.getQuestion);
router.get('/add-question', questions.addQuestion);
router.get('/delete-question', questions.deleteQuestion);



module.exports = router;