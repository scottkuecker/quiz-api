const user = require('./../controllers/user');
const middleware = require('../midleware/auth');
const handler = require('../utils/errorHandler');
const router = require('express').Router();

router.post('/score', handler.handleError(middleware.authMidleware), user.updateScore);
router.post('/update-settings', handler.handleError(middleware.authMidleware), user.updateSettings);
router.get('/reset-lives', handler.handleError(middleware.authMidleware), user.resetLives);
router.post('/ranking-list', handler.handleError(middleware.authMidleware), user.getRankingList);
router.get('/daily-reward', handler.handleError(middleware.authMidleware), user.resetDailyPrice);
router.post('/reset-playing-state', handler.handleError(middleware.authMidleware), user.resetPlayingState);

module.exports = router;