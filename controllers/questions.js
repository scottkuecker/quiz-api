const Question = require('../db_models/question');

exports.getQuestion = (req, res, next) => {
    const question = new Question({
        title: 'Some title',
        price: 12.99
    });

    question.save().then(()=>{
        res.json({
            success: true
        })
    })

}