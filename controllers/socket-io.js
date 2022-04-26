const socketCon = require('../socket');
const Users = require('../db_models/user');
const EVENTS = require('./socket-events');
const TOURNAMENT = require('./socket-functions/tournament');
const AUTH = require('./socket-functions/auth');
const friendListeners = require('./socket-events-setup/friends');
const questionListeners = require('./socket-events-setup/questions');
const roomListeners = require('./socket-events-setup/room');
const tournamentListeners = require('./socket-events-setup/tournament');
const userListeners = require('./socket-events-setup/user');

const saveDBSocket = async (socket, data) =>{
    const IO = TOURNAMENT.getIO();
    const user = await Users.findById(data.user_id);
    if(user){
        user.socket = socket.id;
        user.online = true;
        socket.join(user._id.toString());
        console.log('joined: ' + user._id.toString())
        await user.save();
        return IO.emit(EVENTS.USER_CONNECTED(), { event: EVENTS.USER_CONNECTED(), socket_id: socket.id, user_id: data.user_id })
    }else{
        console.log('socket not saved')
    }
}

const disconectDBSocket = async (io, socket) =>{
    const user = await Users.findOne({socket: socket.id});
    if (user) {
        user.online = false;
        socket.leave(user._id.toString());
        await user.save();
        return io.emit(EVENTS.USER_DISCONECTED(), { event: EVENTS.USER_DISCONECTED(), user_id: user._id })
    }
   
}

//EVENT FUNCTIONS

const disconectSocket = (io, socket) => {
    disconectDBSocket(io, socket)
}

const saveSocket = (socket, data) => {
    saveDBSocket(socket, data)
}


//SOCKETS EVENTS

exports.setupListeners = () =>{
    const socketIo = socketCon.getIO();
    TOURNAMENT.setIOReady();

    friendListeners.setup();
    questionListeners.setup();
    roomListeners.setup();
    tournamentListeners.setup();
    userListeners.setup();

    socketIo.on('connection', socket =>{
        socket.emit(EVENTS.AUTOLOGIN_AVAILABLE(), { event: EVENTS.AUTOLOGIN_AVAILABLE(), data: null })

        socket.on('disconnect', (data) => {
            socketIo.emit(EVENTS.ONLINE_USERS_COUNT(), { event: EVENTS.ONLINE_USERS_COUNT(), online: null})
            disconectSocket(socketIo, socket);
        })

        socket.on(EVENTS.DISCONNECT_USER(), (data) => {  
            disconectSocket(socketIo, socket);
        });

        socket.on(EVENTS.SAVE_SOCKET(), (userData) => {
            saveSocket(socket, userData);
        });

        socket.on(EVENTS.LOGIN(), async data => {
            AUTH.login(socket, data);
        });

        socket.on(EVENTS.REGISTER(), async data => {
            AUTH.signUp(socket, data)
        })
    });
}