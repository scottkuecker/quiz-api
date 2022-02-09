const socketCon = require('../socket');
const crypto = require('crypto');
const Questions = require('../db_models/question');
const Room = require('../db_models/rooms');
const Users = require('../db_models/user');
const Error = require('../db_models/errors');
const EVENTS = require('./socket-events');


const  randomValue = (len) => {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len).toUpperCase();
}

function getRandomNumber(quantity) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(milliseconds * quantity / 1000);
}

const createDBRoom = async (socket, room, userData) =>{
    const user = await Users.findOne({ _id: userData.user_id })
    const newRoom = new Room({
        room_id: room,
        users: [],
        allow_enter: true,
        total_questions: 0,
        created_by: userData.user_id
    })
    const result = await newRoom.save();
    if(result){
        user.room = room;
        user.socket = socket.id;
        await user.save();
        socket.emit(EVENTS.ROOM_CREATED(), {success: true, created_by: newRoom.created_by, event: `${EVENTS.ROOM_CREATED()}`, roomName: room})
    }
}

const joinDBRoom = async (io, socket, userAndRoom) => {
    const rooms = await Room.find({room_id: userAndRoom.roomName});
    const user = await Users.findOne({ _id: userAndRoom.user_id})
    const room = rooms[0];
    if (room && room.allow_enter){
        const haveUser = room.users.some(user => user.id === null || user.id === userAndRoom.user_id);
        user.room = userAndRoom.roomName;
        user.socket = socket.id;
        await user.save();
        if(!haveUser){
            room.users.push({
                name: userAndRoom.name,
                id: userAndRoom.user_id,
                score: 0,
                answered: false,
                avatar: userAndRoom.avatar,
            });
        }
        const result = await room.save();
        if(result){
            socket.join(`${userAndRoom.roomName}`);
            io.to(`${userAndRoom.roomName}`).emit(EVENTS.JOINED_ROOM(), {users: room.users, created_by: room.created_by,event: EVENTS.JOINED_ROOM(), socked: socket.id})
        }
    }else{
        socket.emit(EVENTS.ROOM_DONT_EXIST(), {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: 'joinDBRoom'});
    }
}


const leaveDBRoom = async (io, socket, userAndRoom) => {
    const room = await Room.findOne({room_id: userAndRoom.roomName});
    const user = await Users.findOne({ _id: userAndRoom.user_id })
    if(room){
        const room_id = room._id;
        room.users = room.users.filter(user => user.id !== userAndRoom.user_id);
        await room.save();
        user.room = '';
        await user.save();
        if(!room.users.length){
            await Room.findByIdAndDelete(room_id);
        }
        socket.leave(`${userAndRoom.roomName}`);
        io.to(`${userAndRoom.roomName}`).emit(EVENTS.LEAVED_ROOM(), 
            {users: room.users, event: EVENTS.LEAVED_ROOM()})
    }
}


const startDBTournament = async (io, socket, data) =>{
    const tournamentRoom = await Room.findOne({room_id: data.roomName});
    if(!tournamentRoom){
       return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'startDBTournament'});
    }
    const questions = await Questions.find();
    const room_questions = [];

    async function generateQuestions(){
        return new Promise((resolve, reject) =>{
                    function generate(){
                        if(room_questions.length <= 15){
                            setTimeout(()=>{
                                let random = getRandomNumber(questions.length);
                                let question = questions[random];
                                room_questions.push(question);
                                generate();
                            }, 10)
                        
                        }else{
                            resolve(true)
                        }
                    }
            generate()         
        })
        
    }
    await generateQuestions();
    tournamentRoom.questions = room_questions;
    await tournamentRoom.save();
    io.to(`${data.roomName}`).emit(EVENTS.TOURNAMENT_STARTING(), {event: EVENTS.TOURNAMENT_STARTING()});
}


const getDBQuestion = async (socket, data) =>{
    const tournamentRoom = await Room.findOne({room_id: data.roomName});
    if (!tournamentRoom || !tournamentRoom.allow_enter){
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: `getDBQuestion()|requestedRoom:${data.roomName}|respondedRoom: ${tournamentRoom.room_id}|allow: ${tournamentRoom.allow_enter}`});
    }
    socket.emit(EVENTS.GET_ROOM_QUESTION(), {event: EVENTS.GET_ROOM_QUESTION(), question: tournamentRoom.questions[data.questionIndex]})
}


const startDBTournamentQuestion = async (io, data) =>{
    const room = await Room.findOne({room_id: data.roomName})
    if(!room){
       return io.to(`${data.roomName}`).emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
           fn: 'startDBTournamentQuestion'});
    }
    if(room.total_questions >= 15){
        room.allow_enter = false;
        await room.save();
        io.to(`${data.roomName}`).emit(EVENTS.TOURNAMENT_FINISHED(), { event: EVENTS.TOURNAMENT_FINISHED(), users: room.users});
        return;
    }
    io.to(`${data.roomName}`).emit(EVENTS.EVERYONE_ANSWERED(), { event: EVENTS.EVERYONE_ANSWERED(), users: room.users })
}


const checkDBTournamentQuestion = async (io, socket, data) =>{
    const room = await Room.findOne({room_id: data.roomName})
    if(!room){
       return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
           fn: 'checkDBTournamentQuestion'});
    }
    const question = room.questions[data.questionIndex];
    const users = JSON.parse(JSON.stringify(room.users));
    users.forEach(user =>{
        if(user.id === data.user_id){
            user.answered = true;
            if (data.letter === question.correct_letter){
                user.score++;
            }
        }
    });
    room.users = users;
    await room.save();
    const everyone_answered = room.users.every(user => user.answered === true);
    if(everyone_answered){
        const resetUsers = JSON.parse(JSON.stringify(room.users));
        resetUsers.forEach(user => {
            user.answered = false;
        });
        room.users = resetUsers;
        room.total_questions = room.total_questions + 1;
        await room.save();
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users})
        startDBTournamentQuestion(io, data);

    }else{
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users})
        io.to(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: room.users})
    }
    
}

const getDBRoomResults = async (socket, data) =>{
    const room = await Room.findOne({room_id: data.roomName});
    if(!room){
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'getDBRoomResults'
        });
    }
    socket.emit(EVENTS.GET_ROOM_RESULTS(), { event: EVENTS.GET_ROOM_RESULTS(), users: room.users})
}

const disconectDBSocket = async (socket) =>{

}

const createRoom = (socket, userData) =>{
    const room =  randomValue(5);
    if(room){
        createDBRoom(socket, room, userData)
    }
}

const joinRoom = (io, socket, userAndRoom) => {
        joinDBRoom(io, socket, userAndRoom);
}

const leaveRoom = (io, socket, userAndRoom) => {
    leaveDBRoom(io, socket, userAndRoom);
}

const startTournament = (io, socket, data) =>{
    startDBTournament(io, socket, data);
}

const checkTournamentQuestion = (io, socket, data) => {
    checkDBTournamentQuestion(io, socket, data)
}

const getQuestion = (socket, data) => {
    getDBQuestion(socket, data)
}

const getRoomResults = (socket, data) => {
    getDBRoomResults(socket, data)
}

const disconectSocket = (socket) => {
    disconectDBSocket(socket)
}


exports.setupListeners = () =>{
    const socketIo = socketCon.getIO();
    socketIo.on('connection', socket =>{
        socket.on('disconnect', () => {
            disconectSocket(socket);
        })
        socket.on(EVENTS.CREATE_ROOM(), (userData) =>{
            createRoom(socket, userData);
        });

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
    });

}