const Question = require('../db_models/question');

exports.getQuestion = async (req, res, next) => {
    const question = await Question.findOne()
    if(question){
        return res.json({
            question: question
        })
    }
    return res.json({
        question: []
    })

 

}