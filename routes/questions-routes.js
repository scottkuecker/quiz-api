const questions = require('./../controllers/questions');
const middleware = require('../midleware/auth');
const Validator = require('../utils/validations');
const handler = require('../utils/errorHandler');
const router = require('express').Router();



router.get('/question', handler.handleError(middleware.authMidleware) , handler.handleError(questions.getQuestion));
router.get('/question/:category', handler.handleError(middleware.authMidleware), handler.handleError(questions.getQuestion));
router.get('/all-questions', handler.handleError(middleware.authMidleware), handler.handleError(questions.getAllQuestions));
router.get('/all-questions/:filter', handler.handleError(middleware.authMidleware), handler.handleError(questions.getAllQuestions));
router.post('/add-question', handler.handleError(middleware.authMidleware), Validator.isValidCategory,  handler.handleError(questions.addQuestion));
router.post('/image-question', handler.handleError(middleware.authMidleware), handler.handleError(questions.addImageQuestion));
router.delete('/delete-question/:id', handler.handleError(middleware.authMidleware) ,handler.handleError(questions.deleteQuestion))
router.post('/check-question', handler.handleError(middleware.authMidleware), handler.handleError(questions.checkQuestion))
router.post('/quiz-results', handler.handleError(middleware.authMidleware), handler.handleError(questions.quizResults))
router.post('/reduce-lives', handler.handleError(middleware.authMidleware), handler.handleError(questions.reduceLives))
router.post('/publish', handler.handleError(middleware.authMidleware), handler.handleError(questions.publishQuestion))
router.post('/unpublish', handler.handleError(middleware.authMidleware), handler.handleError(questions.unpublishQuestion))
router.post('/update-question-text', handler.handleError(middleware.authMidleware), handler.handleError(questions.updateQuestionText));
router.post('/fast-question', questions.addFastQuestion);



module.exports = router;