const questions = require('./../controllers/questions');
const middleware = require('../midleware/auth');

const router = require('express').Router();



router.get('/question', middleware.authMidleware ,questions.getQuestion);
router.get('/question/:category', middleware.authMidleware, questions.getQuestion);
router.get('/all-questions', middleware.authMidleware, questions.getAllQuestions);
router.get('/all-questions/:filter', middleware.authMidleware, questions.getAllQuestions);
router.post('/add-question', middleware.authMidleware ,questions.addQuestion);
router.post('/image-question', middleware.authMidleware, questions.addImageQuestion);
router.delete('/delete-question/:id', middleware.authMidleware ,questions.deleteQuestion);
router.post('/check-question', middleware.authMidleware, questions.checkQuestion)
router.post('/quiz-results', middleware.authMidleware, questions.quizResults)
router.post('/reduce-lives', middleware.authMidleware, questions.reduceLives)
router.post('/publish', middleware.authMidleware, questions.publishQuestion)
router.post('/unpublish', middleware.authMidleware, questions.unpublishQuestion)
router.post('/update-question-text', middleware.authMidleware, questions.updateQuestionText);



module.exports = router;