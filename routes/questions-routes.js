const questions = require('./../controllers/questions');
const middleware = require('../midleware/auth');

const router = require('express').Router();



router.get('/question', middleware.authMidleware ,questions.getQuestion);
router.get('/all-questions', middleware.authMidleware, questions.getAllQuestions);
router.post('/add-question', middleware.authMidleware ,questions.addQuestion);
router.delete('/delete-question/:id', middleware.authMidleware ,questions.deleteQuestion);




module.exports = router;