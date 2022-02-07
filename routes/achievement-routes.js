const achievements = require('./../controllers/achievements');
const middleware = require('../midleware/auth');
const handler = require('../utils/errorHandler');
const router = require('express').Router();

router.get('/achievements', handler.handleError(middleware.authMidleware), handler.handleError(achievements.getAchievements));
router.post('/achievements', handler.handleError(middleware.authMidleware), handler.handleError(achievements.createAchievements));



module.exports = router;