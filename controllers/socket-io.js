const socketCon = require('../socket');
const Users = require('../db_models/user');
const handleError = require('../utils/errorHandler');
const EVENTS = require('./socket-events');
const ROOMS = require ('./socket-functions/room');
const FRIEND_REQUESTS = require('./socket-functions/friend-requests');
const TOURNAMENT = require('./socket-functions/tournament');
const QUESTIONS = require('./socket-functions/questions');

const saveDBSocket = async (io, socket, data) =>{
    const user = await Users.findById(data.user_id);
    if(user){
        user.socket = socket.id;
        user.online = true;
        socket.join(data.user_id);
        await user.save();
        return io.emit(EVENTS.USER_CONNECTED(), { event: EVENTS.USER_CONNECTED(), socket_id: socket.id, user_id: data.user_id })
    }
}

const disconectDBSocket = async (io, socket) =>{
    const user = await Users.findOne({socket: socket.id});
    const oneOnOneRoom = TOURNAMENT.getoneOnOneRoom();
    oneOnOneRoom.oneOnOneUsers = oneOnOneRoom.oneOnOneUsers.filter(user => user.socket_id !== socket.id)
    if (user) {
        user.online = false;
        socket.leave(user._id);
        await user.save();
        return io.emit(EVENTS.USER_DISCONECTED(), { event: EVENTS.USER_DISCONECTED(), user_id: user._id })
    }
   
}

//EVENT FUNCTIONS

const joinOneOnOneRoom = (io, socket, data) =>{
    ROOMS.joinOneOnOneDBRoom(io, socket, data)
}

const joinRoom = (io, socket, userAndRoom) => {    
    handleError.handleIOError(ROOMS.joinDBRoom, io, socket, userAndRoom)
}

const leaveRoom = (io, socket, userAndRoom) => {
    handleError.handleIOError(ROOMS.leaveDBRoom, io, socket, userAndRoom) 
}

const startTournament = (io, socket, data) =>{
    handleError.handleIOError(TOURNAMENT.startDBTournament, io, socket, data) 
}

const checkTournamentQuestion = (io, socket, data) => {
    handleError.handleIOError(TOURNAMENT.checkDBTournamentQuestion, io, socket, data) 
}

const getQuestion = (socket, data) => {
    handleError.handleSocketError(QUESTIONS.getDBQuestion, socket, data) 
}

const getRoomResults = (socket, data) => {
    handleError.handleSocketError(ROOMS.getDBRoomResults, socket, data) 
}

const disconectSocket = (io, socket) => {
    disconectDBSocket(io, socket)
}

const addFriend = (socket, data) => {
    FRIEND_REQUESTS.addDBFriend(socket, data)
}

const acceptFriend = (socket, data) => {
    FRIEND_REQUESTS.acceptDBFriend(socket, data)
}

const saveSocket = (io, socket, data) => {
    saveDBSocket(io, socket, data)
}

const leaveOneOnOne = (io, socket, data) =>{
    TOURNAMENT.leaveDBOneOnOne(io, socket, data)
}

const acceptOponent = (socketIo, socket, data) =>{
    TOURNAMENT.acceptDBOponent(socketIo, socket, data)
}

//SOCKETS EVENTS

exports.setupListeners = () =>{
    const socketIo = socketCon.getIO();
    socketIo.on('connection', socket =>{
        const oneOnOneRoom = TOURNAMENT.getoneOnOneRoom();
        oneOnOneRoom.onlineUsers++;
        socketIo.emit(EVENTS.ONLINE_USERS_COUNT(), { event: EVENTS.ONLINE_USERS_COUNT(), online: oneOnOneRoom.onlineUsers })
        socket.on('disconnect', (data) => {
            oneOnOneRoom.onlineUsers--;
            socketIo.emit(EVENTS.ONLINE_USERS_COUNT(), { event: EVENTS.ONLINE_USERS_COUNT(), online: oneOnOneRoom.onlineUsers})
            disconectSocket(socketIo, socket);
        })

        socket.on(EVENTS.DISCONNECT_USER(), (data) => {
            disconectSocket(socketIo, socket);
        });

        socket.on(EVENTS.INVITE_FRIENDS(), (data) => {
            FRIEND_REQUESTS.inviteFriends(socketIo, socket, data);
        });

        socket.on(EVENTS.LEAVE_ONE_ON_ONE(), (data) => {
            leaveOneOnOne(socketIo, socket, data);
        });

        socket.on(EVENTS.OPONENT_ACCEPTED(), (data) => {
            acceptOponent(socketIo, socket, data);
        });

        socket.on(EVENTS.OPONENT_DECLINED(), (data) => {
            TOURNAMENT.declineOponent(socketIo, socket, data);
        });

        socket.on(EVENTS.CREATE_ROOM(), (userData) =>{
            ROOMS.createRoom(socket, userData);
        });

        socket.on(EVENTS.SAVE_SOCKET(), (userData) => {
            saveSocket(socketIo, socket, userData);
        });

        socket.on(EVENTS.JOIN_ONE_ON_ONE(), data => {
            joinOneOnOneRoom(socketIo, socket, data)
        })

        socket.on(EVENTS.JOIN_ROOM(), userAndRoom =>{
            joinRoom(socketIo, socket, userAndRoom);
        })

        socket.on(EVENTS.LEAVE_ROOM(), userAndRoom =>{
            leaveRoom(socketIo, socket, userAndRoom)
        })

        socket.on(EVENTS.START_TOURNAMENT(), data =>{
            startTournament(socketIo, socket, data)
        })

        socket.on(EVENTS.SELECTED_QUESTION_LETTER(), data =>{
            checkTournamentQuestion(socketIo, socket, data)
        })

        socket.on(EVENTS.GET_ROOM_QUESTION(), data =>{
            getQuestion(socket, data)
        })

        socket.on(EVENTS.GET_ROOM_RESULTS(), data => {
            getRoomResults(socket, data)
        })

        socket.on(EVENTS.CLEAN_THE_EMPTY_ROOMS(), data => {
            ROOMS.cleanRooms()
        })

        socket.on(EVENTS.ADD_FRIEND(), data => {
            addFriend(socket, data)
        })

        socket.on(EVENTS.ACCEPT_FRIEND(), data => {
            acceptFriend(socket, data)
        })
    });

}