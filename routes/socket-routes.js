
const middleware = require('../midleware/auth');
const socket = require('../controllers/socket-io');
const router = require('express').Router();

router.get('/somelink', middleware.authMidleware, socket.somesocketRoute);
router.post('/create-room', middleware.authMidleware, socket.createRoom);
router.post('/delete-room', middleware.authMidleware, socket.deleteRoom);
router.post('/enter-room', middleware.authMidleware, socket.enterRoom);


module.exports = router;