
const middleware = require('../midleware/auth');
const socket = require('../controllers/socket-io');
const router = require('express').Router();

router.get('/somelink', middleware.authMidleware, socket.somesocketRoute);


module.exports = router;