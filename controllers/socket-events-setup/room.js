const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const TOURNAMENT = require('../socket-functions/tournament');
const QUESTIONS = require('../socket-functions/questions');
const ROOMS = require('../socket-functions/room');
const midleware = require('../../midleware/auth');

exports.setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', socket => {

        socket.on(EVENTS.LEAVE_ONE_ON_ONE(), (data) => {
            TOURNAMENT.leaveDBOneOnOne(socketIo, socket, data)
        });

        socket.on(EVENTS.JOIN_ONE_ON_ONE(), data => {
            midleware.socketMiddleware(socketIo, socket, data, ROOMS.joinOneOnOne)
        });

        socket.on(EVENTS.CREATE_ROOM(), (userData) => {
            ROOMS.createRoom(socket, userData);
        })

        socket.on(EVENTS.JOIN_ROOM(), userAndRoom => {
            midleware.socketMiddleware(socket, userAndRoom, ROOMS.joinDBRoom);
        })

        socket.on(EVENTS.LEAVE_ROOM(), userAndRoom => {
            ROOMS.leaveDBRoom(socketIo, socket, userAndRoom)
        });

        socket.on(EVENTS.LEAVE_MATCH(), data => {
           socket.leave(data.roomName)
        });

        socket.on(EVENTS.GET_ROOM_RESULTS(), data => {
            ROOMS.getDBRoomResults(socket, data)
        })

        socket.on(EVENTS.CLEAN_THE_EMPTY_ROOMS(), data => {
            ROOMS.cleanRooms()
        });

        socket.on(EVENTS.GET_ROOM_QUESTION(), data => {
            QUESTIONS.getDBQuestion(socket, data)
        })
    })
}