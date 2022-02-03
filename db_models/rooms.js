const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const room = new Schema({
    room_id: { type: String, required: true },
    current_question: { type: Object, required: true, default: null},
    users: [
        { type: Object, required: true }
    ],
    allow_enter: { type: Boolean, required: true, default: true },
    created_by: String
});


module.exports = mongoose.model('Rooms', room)