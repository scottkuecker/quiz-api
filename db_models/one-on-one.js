const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const room = new Schema({
    room_id: { type: String, required: true, default: '1on1' },
    users: [
        { type: String, required: true }
    ],
});


module.exports = mongoose.model('OneOnOne', room)