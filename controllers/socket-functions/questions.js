const Room = require('../../db_models/rooms');
const EVENTS = require('../socket-events');

exports.getDBQuestion = async (socket, data) => {
    const tournamentRoom = await Room.findOne({ room_id: data.roomName });
    console.log(tournamentRoom)
    if (!tournamentRoom || !tournamentRoom.allow_enter) {
        socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: `getDBQuestion()|requestedRoom:${data.roomName}|respondedRoom: ${tournamentRoom.room_id}|allow: ${tournamentRoom.allow_enter}`
        });
    }
    socket.emit(EVENTS.GET_ROOM_QUESTION(), { event: EVENTS.GET_ROOM_QUESTION(), question: tournamentRoom.questions[data.questionIndex] })
    return true
}