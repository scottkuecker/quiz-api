const socketCon = require('../socket');
const crypto = require('crypto')
const Room = require('../db_models/rooms');


const  randomValue = (len) => {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len).toUpperCase();
}

const createDBRoom = async (socket, room, userData) =>{
    const newRoom = new Room({
        room_id: room,
        users: [],
        allow_enter: true,
        created_by: userData.user_id
    })
    const result = await newRoom.save();
    if(result){
        socket.emit('ROOM-CREATED', {success: true, event: 'ROOM-CREATED', roomName: room})
    }
}

const joinDBRoom = async (io, socket, userAndRoom) => {
    const rooms = await Room.find({room_id: userAndRoom.roomName});
    const room = rooms[0];
    if(room){
        const haveUser = room.users.some(user => user.id === null || user.id === userAndRoom.user_id);
        if(!haveUser){
            room.users.push({
                name: userAndRoom.name,
                id: userAndRoom.user_id,
                avatar: userAndRoom.avatar,
            });
        }
        const result = await room.save();
        if(result){
            socket.join(`${userAndRoom.roomName}`);
            io.to(`${userAndRoom.roomName}`).emit('JOINED-ROOM', {users: room.users, event: 'JOINED-ROOM', socked: socket.id})
        }
    }else{
        socket.emit('ROOM-DONT-EXIST', {event: 'ROOM-DONT-EXIST'});
    }
}

const leaveDBRoom = async (io, socket, userAndRoom) => {
    const room = await Room.findOne({room_id: userAndRoom.roomName});
    if(room){
        const room_id = room._id;
        room.users = room.users.filter(user => user.id !== userAndRoom.user_id);
        await room.save();
        if(!room.users.length){
            await Room.findByIdAndDelete(room_id);
        }
        socket.leave(`${userAndRoom.roomName}`);
        io.to(`${userAndRoom.roomName}`).emit('LEAVED-ROOM', {users: room.users, event: 'LEAVED-ROOM'})
    }
}

const createRoom = (socket, userData) =>{
    const room =  randomValue(5);
    if(room){
        createDBRoom(socket, room, userData)
    }
}

const joinRoom = (io, socket, userAndRoom) => {
    joinDBRoom(io, socket, userAndRoom)
}

const leaveRoom = (io, socket, userAndRoom) => {
    leaveDBRoom(io, socket, userAndRoom)
}

exports.setupListeners = () =>{
    const socketIo = socketCon.getIO();
    socketIo.on('connection', socket =>{
        socket.on('CREATE-ROOM', (userData) =>{
            createRoom(socket, userData);
        });

        socket.on('JOIN-ROOM', userAndRoom =>{
            joinRoom(socketIo, socket, userAndRoom);
        })

        socket.on('LEAVE-ROOM', userAndRoom =>{
            leaveRoom(socketIo, socket, userAndRoom)
        })
    })
}