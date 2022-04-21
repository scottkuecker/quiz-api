const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    question: { type: String, required: true },
    correct_letter: { type: String, required: false},
    correct_text: { type: String, required: false },
    answered_correctly: { type: Number, required: false, default: 0 },
    posted_by: { type: String, required: false, default: 'USER' },
    category: String,
    type: {type: String, required: false, default: 'REGULAR'},
    imageUrl: {type: String, required: false},
    answered_wrong: { type: Number, required: false, default: 0  },
    question_picked: { type: Number, required: false, default: 0  },
    status: { type: String, required: true, default: "NA CEKANJU" },
    answers: [],
    question_difficulty: { type: Number, required: false, default: 1 },
});


module.exports = mongoose.model('Question', questionSchema)
