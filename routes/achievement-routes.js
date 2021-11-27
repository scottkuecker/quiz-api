const achievements = require('./../controllers/achievements');
const middleware = require('../midleware/auth');

const router = require('express').Router();

router.get('/achievements', middleware.authMidleware, achievements.getAchievements);
router.post('/achievements', middleware.authMidleware, achievements.createAchievements);



module.exports = router;