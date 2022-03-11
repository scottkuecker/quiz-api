const Room = require('../../db_models/rooms');
const EVENTS = require('../socket-events');
const Questions = require('../../db_models/question');


function getRandomNumber(quantity) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(Math.random(Math.floor(milliseconds * quantity / 1000)) * quantity)
}

exports.getDBQuestion = async (socket, data) => {
    const tournamentRoom = await Room.findOne({ room_id: data.roomName });
    if (!tournamentRoom || !tournamentRoom.allow_enter) {
        socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: `getDBQuestion()|requestedRoom:${data.roomName}|respondedRoom: ${tournamentRoom.room_id}|allow: ${tournamentRoom.allow_enter}`
        });
    }
    socket.emit(EVENTS.GET_ROOM_QUESTION(), { event: EVENTS.GET_ROOM_QUESTION(), question: tournamentRoom.questions[data.questionIndex] })
    return true
}

exports.generateRoomQuestions = async (roomName, amount, usersArr) => {
    const tournamentRoom = await Room.findOne({ room_id: roomName });
    const amountOfQuestions = amount;

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
    tournamentRoom.users = usersArr;
    await tournamentRoom.save();
}