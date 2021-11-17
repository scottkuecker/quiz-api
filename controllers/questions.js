const Question = require('../db_models/question');

exports.getQuestion = (req, res, next) => {
    Question.findOne()
    .then(res =>{
        console.log(res)
    })
}