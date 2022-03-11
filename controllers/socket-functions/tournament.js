const Room = require('../../db_models/rooms');
const ROOMS = require('../socket-functions/room');
const QUESTIONS = require('./questions'); //socket event functions
const Questions = require('../../db_models/question'); //mongoDB model
const EVENTS = require('../socket-events');
const Users = require('../../db_models/user');

var oneOnOneRoom = {
    oneOnOneUsers: [],
    onlineUsers: 0
}

function getRandomNumber(quantity) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(Math.random(Math.floor(milliseconds * quantity / 1000)) * quantity)
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
    if (room.total_questions >= 15) {
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
    const me = oneOnOneRoom.oneOnOneUsers.find(user => user._id === data.user_id);
    if (!me.blocked.includes(data.oponent_id)) {
        me.blocked.push(data.oponent_id)
    }
    me.gameAccepted = false;
    socket.emit(EVENTS.OPONENT_DECLINED(), { event: EVENTS.OPONENT_DECLINED() })
}

exports.createOneOnOneUsers = async (usersArr) =>{
    const user1 = usersArr[0];
    const user2 = usersArr[1];

    const userOne = await Users.findOne({_id: user1._id});
    const userTwo = await Users.findOne({ _id: user2._id });
    if(!userOne || !userTwo){
        return;
    }

    const user1Mapped = {
        name: userOne.name,
        id: userOne._id,
        score: 0,
        answered: false,
        avatar: userOne.avatar
    }
    const user2Mapped = {
        name: userOne.name,
        id: userOne._id,
        score: 0,
        answered: false,
        avatar: userOne.avatar
    }
    return [user1Mapped, user2Mapped];
}

exports.acceptDBOponent = async (io, socket, data) => {
    const me = oneOnOneRoom.oneOnOneUsers.find(user => user._id === data.user_id);
    const oponent = oneOnOneRoom.oneOnOneUsers.find(user => user._id === data.oponent_id);
    if (!me || !oponent) {
        return;
    }
    me.gameAccepted = true;
    socket.join(data.roomName)
    io.in(oponent._id).emit(EVENTS.OPONENT_ACCEPTED(), { event: EVENTS.OPONENT_ACCEPTED(), success: true })
    if (me.gameAccepted && oponent.gameAccepted) {
        const users = await this.createOneOnOneUsers([me, oponent])
        await ROOMS.createDBRoom(socket, data.roomName, data);
        await QUESTIONS.generateRoomQuestions(data.roomName, 15, users);
        io.to(data.roomName).emit(EVENTS.BOTH_ACCEPTED(), { event: EVENTS.BOTH_ACCEPTED(), success: true })
    }
}
exports.leaveDBOneOnOne = (io, socket, data) => {
    if (oneOnOneRoom.oneOnOneUsers.length) {
        oneOnOneRoom.oneOnOneUsers = oneOnOneRoom.oneOnOneUsers.filter(user => user._id !== data.user_id);
        socket.emit(EVENTS.LEAVE_ONE_ON_ONE(), { event: EVENTS.LEAVE_ONE_ON_ONE(), success: true })
    } else {
        socket.emit(EVENTS.LEAVE_ONE_ON_ONE(), { event: EVENTS.LEAVE_ONE_ON_ONE(), success: true })
    }
}