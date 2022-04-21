const Room = require('../../db_models/rooms');
const Users = require('../../db_models/user');
const TOURNAMENT = require('./tournament');
const crypto = require('crypto');
const EVENTS = require('../socket-events');



exports.randomValue = (len) => {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len).toUpperCase();
}

exports.createRoom = (socket, userData) => {
    const room = this.randomValue(5);
    if (room) {
        return this.createDBRoom(socket, room, userData)
    }
}
exports.cleanRooms = async () => {
    const result = { success: true }
    const rooms = await Room.find();
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].total_questions === 15 && !rooms[i].allow_enter) {
            await Room.findByIdAndDelete(rooms[i]._id)
        }
    }
    return result;
}

exports.createMatchRoom = async (room, users) => {
    const response = { success: false }
    const newRoom = new Room({
        room_id: room,
        users: users,
        allow_enter: true,
        total_questions: 0
    })
    const result = await newRoom.save();
    if (result) {
        response.success = true;
    }
    return response;
}

exports.createDBRoom = async (socket, room, userData) => {
    const response = { success: false }
    const user = await Users.findOne({ _id: userData.user_id });
    const startsAt = userData.startsAt || 0;
    const newRoom = new Room({
        room_id: room,
        users: [],
        allow_enter: true,
        total_questions: 0,
        startsAt: startsAt,
        created_by: userData.user_id
    })
    const result = await newRoom.save();
    if (result) {
        user.room = room;
        user.socket = socket.id;
        await user.save();
        result.success = true;
        socket.emit(EVENTS.ROOM_CREATED(), { success: true, created_by: newRoom.created_by, event: `${EVENTS.ROOM_CREATED()}`, roomName: room })
    }
    return response;
}

exports.joinDBRoom = async (socket, userAndRoom) => {
    if (userAndRoom.roomName === '1on1') {
        return this.joinOneOnOne(socket, userAndRoom)
    }
    const io = TOURNAMENT.getIO()
    const response = { success: false }
    const rooms = await Room.find({ room_id: userAndRoom.roomName });
    const user = await Users.findOne({ _id: userAndRoom.user_id });
    const socketRooms = socket.rooms;
    if (socketRooms){
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`)
        });
        socket.join(`${userAndRoom.user_id}`)
    }

    const room = rooms[0];
    if (room && room.allow_enter) {
        const haveUser = room.users.some(user => user.id === null || user.id === userAndRoom.user_id);
        user.room = userAndRoom.roomName;
        user.socket = socket.id;
        await user.save();
        if (!haveUser) {
            room.users.push({
                name: userAndRoom.name,
                id: userAndRoom.user_id,
                score: 0,
                answered: false,
                avatar: userAndRoom.avatar,
            });
        }
        const result = await room.save();
        if (result) {
            result.success = true;
            socket.join(`${userAndRoom.roomName}`);
            io.in(`${userAndRoom.roomName}`).emit(EVENTS.JOINED_ROOM(), { users: room.users, created_by: room.created_by, event: EVENTS.JOINED_ROOM(), socked: socket.id })
        }
    } else {
        socket.emit(EVENTS.ROOM_DONT_EXIST(), {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: 'joinDBRoom'
        });
    }
    return response;
}


exports.leaveDBRoom = async (socket, userAndRoom) => {
    const io = TOURNAMENT.getIO()
    const room = await Room.findOne({ room_id: userAndRoom.roomName });
    const socketRooms = socket.rooms;
    if(socketRooms){
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`)
        });
        socket.join(`${userAndRoom.user_id}`)
    }
    if (room) {
        const room_id = room._id;
        room.users = room.users.filter(user => user.id !== userAndRoom.user_id);
        await room.save();
        if (!room.users.length) {
            await Room.findByIdAndDelete(room_id);
        }
        io.in(`${userAndRoom.roomName}`).emit(EVENTS.LEAVED_ROOM(),
            { users: room.users, event: EVENTS.LEAVED_ROOM() })
    }
}

exports.getDBRoomResults = async (socket, data) => {
    const room = await Room.findOne({ room_id: data.roomName });
    if (!room) {
        return socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: `${EVENTS.ROOM_DONT_EXIST()}`,
            fn: 'getDBRoomResults'
        });
    }
    socket.emit(EVENTS.GET_ROOM_RESULTS(), { event: EVENTS.GET_ROOM_RESULTS(), users: room.users })
}

exports.joinOneOnOneDBRoom = async (socket, data) => {
    const socketRooms = socket.rooms;
    if (socketRooms) {
        socketRooms.forEach(rm => {
            socket.leave(`${rm}`)
        });
        socket.join(`${data.user_id}`)
    }

}


exports.joinOneOnOne = async (socket, userAndRoom) => {
    const QUEUE = TOURNAMENT.getQueue();
    const user = { 
        _id: userAndRoom.user_id,
        name: userAndRoom.data.name,
        socket: socket.id, 
        blocked: [], 
        gameAccepted: false,
        playing: false,
        avatar_url: userAndRoom.avatar_url
     };

    QUEUE.addToQueue(user, socket);


}