const Room = require('../../db_models/rooms');
const ROOMS = require('../socket-functions/room');
const QUESTIONS = require('./questions'); //socket event functions
const Questions = require('../../db_models/question'); //mongoDB model
const EVENTS = require('../socket-events');
const Users = require('../../db_models/user');
const socketCon = require('../../socket');

var IO;

var oneOnOneRoom = {
    oneOnOneUsers: [],
    nextMatch: [],
    onlineUsers: 0,
    leave: function (id) {
        this.onlineUsers--;
        this.oneOnOneUsers = this.oneOnOneUsers.filter(user => user._id !== id)
    },
    join: function (user) {
        this.onlineUsers++;
        const allreadyIn = this.nextMatch.find(u => u._id === user._id);
        if (allreadyIn){
            return;
        }
        this.oneOnOneUsers.push(user)
    },
    joinForNextMatch: function (user){
        this.nextMatch.push(user)
    },
    getMatch: function(){
        const match = JSON.parse(JSON.stringify(this.nextMatch));
        this.nextMatch = [];
        this.leave(match[0]._id);
        this.leave(match[1]._id);
        return match;
    },
    matchPosible: function (){
        console.log(this.oneOnOneUsers.length)
        return this.oneOnOneUsers.length > 1;
    }
}
var interval = null;



const getRandomNumber = (quantity) => {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(Math.random(Math.floor(milliseconds * quantity / 1000)) * quantity)
}

exports.setIOReady = () => {
    IO = socketCon.getIO();
}

exports.increaseOnlineUsers = () => {
}
exports.decreaseOnlineUsers = () => {
}

const searchPlayersToOneOnOne = async () =>{
    if (oneOnOneRoom.matchPosible()){
        oneOnOneRoom.oneOnOneUsers.forEach((user, index) =>{
            if(index === 0 || index === 1){
                oneOnOneRoom.joinForNextMatch(user)
            }
        });
        clearInterval(interval);
        startOneOnOneMatch(oneOnOneRoom.getMatch());
    }
    
}

const startOneOnOneMatch = async (arrOfTwo) => {
    console.log(arrOfTwo)
    const roomName = ROOMS.randomValue(5);
    const user1 = JSON.parse(JSON.stringify(arrOfTwo[0]));
    const user2 = JSON.parse(JSON.stringify(arrOfTwo[1]));
    const room = new Room({
        room_id: roomName,
        users: [],
        allow_enter: true,
        total_questions: 0,
        created_by: 'SERVER'
    });
    await room.save();
    IO.in(user1._id.toString()).emit(EVENTS.MATCH_FOUND(), {event: EVENTS.MATCH_FOUND(), me: arrOfTwo[0], oponent: arrOfTwo[1], roomName })
    IO.in(user2._id.toString()).emit(EVENTS.MATCH_FOUND(), {event: EVENTS.MATCH_FOUND(), me: arrOfTwo[1], oponent: arrOfTwo[0], roomName })
    this.startListeningOneOnOne();
    return true;
    
}

exports.startListeningOneOnOne = () =>{
    interval = setInterval(searchPlayersToOneOnOne, 3000);
}

exports.getoneOnOneRoom = () => {
    return oneOnOneRoom;
}

exports.startDBTournament = async (io, socket, data) => {
    const tournamentRoom = await Room.findOne({ room_id: data.roomName });
    const amountOfQuestions = data.amountOfQuestions || 15;
    if (!tournamentRoom) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'startDBTournament'
        });
    }
    const questions = await Questions.find({ status: 'ODOBRENO' });
    const room_questions = [];

    async function generateQuestions() {
        return new Promise((resolve, reject) => {
            function generate() {
                if (room_questions.length <= amountOfQuestions) {
                    setTimeout(() => {
                        let filtered = questions.filter(quest => {
                            if (room_questions.some(q => q._id === quest._id)) {
                                return false;
                            } else {
                                return true;
                            }
                        })
                        let random = getRandomNumber(filtered.length);
                        let question = filtered[random];
                        room_questions.push(question);
                        generate();
                    }, Math.round(Math.random()) * 10)

                } else {
                    resolve(true)
                }
            }
            generate()
        })

    }
    await generateQuestions();
    tournamentRoom.questions = room_questions;
    await tournamentRoom.save();
    io.to(`${data.roomName}`).emit(EVENTS.TOURNAMENT_STARTING(), { event: EVENTS.TOURNAMENT_STARTING() });
}


exports.startDBTournamentQuestion = async (io, data) => {
    const room = await Room.findOne({ room_id: data.roomName })
    if (!room) {
        return io.in(`${data.roomName}`).emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'startDBTournamentQuestion'
        });
    }
    if (room.total_questions >= 2) {
        room.allow_enter = false;
        await room.save();
        io.in(`${data.roomName}`).emit(EVENTS.TOURNAMENT_FINISHED(), { event: EVENTS.TOURNAMENT_FINISHED(), users: room.users });
        return;
    }
    io.in(`${data.roomName}`).emit(EVENTS.EVERYONE_ANSWERED(), { event: EVENTS.EVERYONE_ANSWERED(), users: room.users })
}



exports.checkDBTournamentQuestion = async (io, socket, data) => {
    const room = await Room.findOne({ room_id: data.roomName });
    if (!room) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'checkDBTournamentQuestion'
        });
    }
    const question = room.questions[data.questionIndex];
    const users = JSON.parse(JSON.stringify(room.users));
    users.forEach(user => {
        if (user.id === data.user_id) {
            user.answered = true;
            if (data.letter === question.correct_letter) {
                user.score++;
            }
        }
    });
    room.users = users;
    await room.save();
    const everyone_answered = room.users.every(user => user.answered === true);
    if (everyone_answered) {
        const resetUsers = JSON.parse(JSON.stringify(room.users));
        resetUsers.forEach(user => {
            user.answered = false;
        });
        room.users = resetUsers;
        room.total_questions = room.total_questions + 1;
        await room.save();
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users })
        this.startDBTournamentQuestion(io, data);

    } else {
        socket.emit(EVENTS.SELECTED_QUESTION_LETTER(), { correct: data.letter === question.correct_letter, event: EVENTS.SELECTED_QUESTION_LETTER(), users: room.users })
        io.in(`${data.roomName}`).emit(EVENTS.UPDATE_WAITING_STATUS(), { event: EVENTS.UPDATE_WAITING_STATUS(), users: room.users })
    }

}


exports.declineOponent = (io, socket, data) => {
    socket.emit(EVENTS.OPONENT_DECLINED(), { event: EVENTS.OPONENT_DECLINED() })
}

exports.createOneOnOneUsers = async (usersArr) =>{
    const user1 = JSON.parse(JSON.stringify(usersArr[0]));
    const user2 = JSON.parse(JSON.stringify(usersArr[1]));
    const userOne = await Users.findById({ _id: user1._id });
    const userTwo = await Users.findById({ _id: user2._id });
    if(!userOne || !userTwo){
        return null;
    }

    const user1Mapped = {
        name: userOne.name,
        id: userOne._id,
        score: 0,
        answered: false,
        avatar: userOne.avatar_url,
        socket: userOne.socket
    }
    const user2Mapped = {
        name: userTwo.name,
        id: userTwo._id,
        score: 0,
        answered: false,
        avatar: userTwo.avatar_url,
        socket: userTwo.socket
    }
    return [user1Mapped, user2Mapped];
}

exports.acceptDBOponent = async (io, socket, data) => {
    socket.join(data.roomName);
    io.in(data.oponent._id).emit(EVENTS.OPONENT_ACCEPTED(), { event: EVENTS.OPONENT_ACCEPTED(), success: true })
    const room = await io.in(data.roomName).allSockets();
    if(room.size === 2){
        const users = await this.createOneOnOneUsers([data.me, data.oponent])
        await QUESTIONS.generateRoomQuestions(data.roomName, 2, users);
        io.to(data.roomName).emit(EVENTS.BOTH_ACCEPTED(), { event: EVENTS.BOTH_ACCEPTED(), success: true })
    }
}

exports.leaveDBOneOnOne = (io, socket, data) => {
    oneOnOneRoom.leave(data.user_id);
    socket.emit(EVENTS.LEAVE_ONE_ON_ONE(), { event: EVENTS.LEAVE_ONE_ON_ONE(), success: true })
}