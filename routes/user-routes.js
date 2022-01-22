const user = require('./../controllers/user');
const middleware = require('../midleware/auth');

const router = require('express').Router();

router.post('/score', middleware.authMidleware, user.updateScore);
router.post('/update-settings', middleware.authMidleware, user.updateSettings);
router.get('/reset-lives', middleware.authMidleware, user.resetLives);
router.post('/ranking-list', middleware.authMidleware, user.getRankingList);
router.get('/daily-reward', middleware.authMidleware, user.resetDailyPrice);
router.post('/reset-playing-state', middleware.authMidleware, user.resetPlayingState);

module.exports = router;