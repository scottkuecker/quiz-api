const io = require('../socket');
const crypto = require('crypto')
const Room = require('../db_models/rooms');


function randomValue(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len).toUpperCase();
}

exports.somesocketRoute = (req, res,next) =>{
    io.getIO().emit('test', {test: "this is just test"})
    return res.send({
        success: true,
        data: null,
        error: undefined,
        message: undefined
    })
}

exports.createRoom = async (req, res, next) => {
    const roomId = randomValue(6);
    const room = new Room({
        room_id: roomId,
        users: [
            { user_id: req.user._id, name: req.user.name }
        ],
        created_by: req.user._id
    })
    await room.save()
    io.getIO().emit('test', { test: "this is just test" })
    return res.send({
        success: true,
        data: room,
        error: undefined,
        message: undefined
    })
}

exports.deleteRoom = async (req, res, next) => {
   const roomId = req.body.roomId;
   const success = await Room.findByIdAndDelete(roomId)
    if(success){
        return res.send({
            success: true,
            data: null,
            error: undefined,
            message: undefined
        })
    }
    return res.send({
        success: false,
        data: null,
        error: undefined,
        message: undefined
    })
}

exports.enterRoom = async (req, res, next) => {
    const data = [];
    const clients = io.getIO().eio.clients;
    Object.keys(clients).forEach(key =>{
        data.push(clients['id'])
    })
    console.log(data)
    return res.send({
        success: true,
        data: data
    });
    const roomId = req.body.roomId;
    const room = await Room.findById(roomId);
    const user = {
        id: req.user._id,
        name: req.user.name
    }
    if(room){
        room.users.push(user);
        await room.save();
        io.getIO().emit('user-joined', { room });
    }
}