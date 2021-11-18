const Question = require('../db_models/question');
const messages = require('../messages');

exports.getQuestion = async (req, res, next) => {
    const id = req.user._id || null;
    console.log(id)
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
            data: questionsByOthers[random],
            message: ''
        })
    }
    return res.json({
        success: false,
        message: messages.empty_questions_list
    })
}

exports.getAllQuestions = async (req, res, next) => {
    if(!req.user){
        res.send({
            success: false,
            message: 'Something went wrong. Please login again.'
        })
    }
    const id = req.user._id.toString();
    const root = req.user.roles.some(role => role === 'ADMIN')
    if (!id) {
        return res.json({
            sucess: false,
            message: messages.get_question_missing_id
        })
    }
    const questions = await Question.find();
    const questionsByOthers = [];

    questions.forEach(q => {
        console.log(id, q._id.toString())
        if(!root){
            if (q.posted_by === id) {
                questionsByOthers.push(q);
            }
        }else{
            questionsByOthers.push(q)
        }
     
    });
    if (questionsByOthers.length) {
        return res.json({
            success: true,
            data: questionsByOthers,
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
    const correct_letter = req.body.correct_letter || 'B';
    const correctText = req.body.correct_text || 'Some correct answer';
    console.log(req.body)
    const allAnswers = req.body.answers || 
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
        posted_by: req.user._id.toString(),
        answers: allAnswers
    });

    question.save();
    res.send({
        success: true,
        message: 'Question added'
    })
}

exports.deleteQuestion = async (req, res, next) =>{
    const id = req.params.id || null;
    if(!id){
        return res.json({
            sucess: false,
            message: messages.delete_question_missing_id
        })
    }
    await Question.findByIdAndDelete(id);
    const userId = req.user._id;
    const root = req.user.roles.some(role => role === 'ADMIN')
    const questions = await Question.find();
    const questionsByOthers = [];
    questions.forEach(q => {
        if (!root) {
            if (q._id.toString() === userId) {
                questionsByOthers.push(q);
            }
        } else {
            questionsByOthers.push(q)
        }

    });
    if (questionsByOthers.length) {
        return res.json({
            success: true,
            data: questionsByOthers,
            message: ''
        })
    }
    return res.json({
        success: true,
        message: messages.empty_questions_list
    })
    
}