const Question = require('../db_models/question');
const messages = require('../messages');

exports.getQuestion = async (req, res, next) => {
    const id = req.body.id || null;
    if(!id){
        return res.json({
            sucess: false,
            message: messages.get_question_missing_id
        })
    }
    const questions = await Question.find({ question_status: 'PUBLISHED'});
    const questionsByOthers = [];
    questions.forEach(q =>{
        if(q._id.toString() !== id){
            questionsByOthers.push(q);
        }
    });
    let random = Math.floor(Math.random() * questionsByOthers.length);
    if (questionsByOthers && questionsByOthers.length){
        return res.json({
            success: true,
            question: questionsByOthers[random],
            message: ''
        })
    }
    return res.json({
        success: false,
        message: messages.empty_questions_list
    })
}

exports.addQuestion = async (req, res, next) =>{
    const questionText = req.body.question || 'Some question?';
    const correct_letter = req.body.correctLetter || 'B';
    const correctText = req.body.correctText || 'Some correct answer';
    const allAnswers = req.body.allAnswers || 
    [
        { letter: 'A', text: 'Some wrong text'},
        { letter: 'B', text: 'Some correct answer' },
        { letter: 'C', text: 'Some wrong text' },
        { letter: 'D', text: 'Some wrong text' }
    ];

    //TODO const user = req.user;

    const question = new Question({
        question: questionText,
        correct_letter: correct_letter,
        correct_text: correctText,
        posted_by: 'ADMIN',
        answers: allAnswers
    });

    question.save();
}

exports.deleteQuestion = async (req, res, next) =>{
    const id = req.body.id || null;
    if(!id){
        return res.json({
            sucess: false,
            message: messages.delete_question_missing_id
        })
    }
    const del = await Question.findByIdAndDelete(id);
    if(del){
        res.json({
            success: true,
            message: messages.question_deleted
        })
    }
}