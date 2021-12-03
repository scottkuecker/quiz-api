const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    question: { type: String, required: true },
    correct_letter: { type: String, required: true},
    correct_text: { type: String, required: true },
    answered_correctly: { type: Number, required: true, default: 0 },
    posted_by: { type: String, required: true, default: 'ADMIN' },
    category: String,
    type: {type: String, required: true, default: 'REGULAR'},
    imageUrl: {type: String, required: false},
    answered_wrong: { type: Number, required: true, default: 0  },
    question_picked: { type: Number, required: true, default: 0  },
    status: { type: String, required: true, default: "ODOBRENO" },
    answers: [
        { 
            letter: { type: String, required: true }, 
            text: { type: String, required: true }
        }
    ],
    question_difficulty: { type: Number, required: false, default: 1 },
});


module.exports = mongoose.model('Question', questionSchema)
