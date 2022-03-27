const socketCon = require('../socket');
const Users = require('../db_models/user');
const midleware = require('../midleware/auth');
const handleError = require('../utils/errorHandler');
const EVENTS = require('./socket-events');
const ROOMS = require ('./socket-functions/room');
const FRIEND_REQUESTS = require('./socket-functions/friend-requests');
const TOURNAMENT = require('./socket-functions/tournament');
const QUESTIONS = require('./socket-functions/questions');
const ACHIEVEMENTS = require('./socket-functions/achievements');
const AUTH = require('./auth');
const USERS = require('./socket-functions/user');

const saveDBSocket = async (io, socket, data) =>{
    const user = await Users.findById(data.user_id);
    if(user){
        user.socket = socket.id;
        user.online = true;
        socket.join(user._id.toString());
        TOURNAMENT.increaseOnlineUsers();
        await user.save();
        return io.emit(EVENTS.USER_CONNECTED(), { event: EVENTS.USER_CONNECTED(), socket_id: socket.id, user_id: data.user_id })
    }else{
        console.log('socket not saved')
    }
}

const disconectDBSocket = async (io, socket) =>{
    const user = await Users.findOne({socket: socket.id});
    const oneOnOneRoom = TOURNAMENT.getoneOnOneRoom();
    oneOnOneRoom.oneOnOneUsers = oneOnOneRoom.oneOnOneUsers.filter(user => user.socket_id !== socket.id)
    if (user) {
        user.online = false;
        socket.leave(user._id.toString());
        TOURNAMENT.decreaseOnlineUsers();
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
    TOURNAMENT.setIOReady();
    TOURNAMENT.startListeningOneOnOne(socketIo);
    socketIo.on('connection', socket =>{
        const oneOnOneRoom = TOURNAMENT.getoneOnOneRoom();
        socketIo.emit(EVENTS.ONLINE_USERS_COUNT(), { event: EVENTS.ONLINE_USERS_COUNT(), online: oneOnOneRoom.onlineUsers })
        socket.on('disconnect', (data) => {
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
        });

        socket.on(EVENTS.REFRESH_USER(), data => {
            midleware.socketMiddleware(socket, data, AUTH.refresh)
        })
        socket.on(EVENTS.AUTOLOGIN(), async data => {
            midleware.socketMiddleware(socket, data, AUTH.autoLogin);
        });
        socket.on(EVENTS.LOGIN(), async data => {
            AUTH.login(socket, data);
        });
        socket.on(EVENTS.REGISTER(), async data => {
            AUTH.signUp(socket, data)
        })
        socket.on(EVENTS.GET_ALL_USERS(), async data => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.searchUsers);
        });

        socket.on(EVENTS.GET_FRIEND_LIST(), async data => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.getFriendList)
        });

        socket.on(EVENTS.GET_FRIEND_REQUESTS(), async data => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.getFriendRequests)
        })

        socket.on(EVENTS.REMOVE_FRIEND(), async data => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.removeFriend)
        })
        socket.on(EVENTS.ADD_QUESTION(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.addQuestion)
        })
        socket.on(EVENTS.GET_QUESTIONS(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.getAllQuestions)
        })
        socket.on(EVENTS.GET_RANKING_LIST(), async data => {
            midleware.socketMiddleware(socket, data, USERS.getRankingList)
        })
        socket.on(EVENTS.GET_DAILY_REWARD(), async data => {
            midleware.socketMiddleware(socket, data, USERS.resetDailyPrice)
        })
        socket.on(EVENTS.RESET_PLAYING_STATE(), async data => {
            midleware.socketMiddleware(socket, data, USERS.resetPlayingState)
        })
        socket.on(EVENTS.RESET_LIVES(), async data => {
            midleware.socketMiddleware(socket, data, USERS.resetLives)
        })
        socket.on(EVENTS.UPDATE_SCORE(), async data => {
            midleware.socketMiddleware(socket, data, USERS.updateScore)
        })
        socket.on(EVENTS.UPDATE_SETTINGS(), async data => {
            midleware.socketMiddleware(socket, data, USERS.updateSettings)
        })
        socket.on(EVENTS.CHECK_QUESTION(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.checkQuestion)
        })
        socket.on(EVENTS.DELETE_QUESTION(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.deleteQuestion)
        })
        socket.on(EVENTS.REMOVE_NOTIFICATION(), async data => {
            midleware.socketMiddleware(socket, data, USERS.removeNotification)
        })
        socket.on(EVENTS.REDUCE_LIVES(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.reduceLives)
        })
        socket.on(EVENTS.GET_ACHIEVEMENTS(), async data => {
            midleware.socketMiddleware(socket, data, ACHIEVEMENTS.getAchievements)
        })

    });

}