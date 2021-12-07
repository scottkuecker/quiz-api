const Question = require('../db_models/question');
const Users = require('../db_models/user');
const messages = require('../messages');


exports.getQuestion = async (req, res, next) => {
    const id = req.user._id || null;
    const user = await Users.findById(req.user._id);
    const category = req.body.category
    user.playing = true;
    await user.save();
    if(!id){
        return res.json({
            sucess: false,
            message: messages.get_question_missing_id
        })
    }
    let questions;
    if(category){
        questions = await Question.find({ status: 'ODOBRENO', category });
    }else{
        questions = await Question.find({ status: 'ODOBRENO' });
    }
   
    const questionsByOthers = [];
    questions.forEach(q =>{
        if(q._id.toString() !== id){
            questionsByOthers.push(q);
        }
    });
    let random = Math.floor(Math.random() * questionsByOthers.length);
    if (questionsByOthers && questionsByOthers.length){
        let picked = questionsByOthers[random];
        let timesPicked = picked.question_picked + 1;
        await Question.findByIdAndUpdate({ _id: picked._id.toString() }, { question_picked: timesPicked})
        return res.json({
            success: true,
            data: questionsByOthers[random],
            message: ''
        })
    }else{
        return res.json({
            success: false,
            message: messages.empty_questions_list
        })
    }

}

exports.publishQuestion = async(req, res, next) => {
    const id = req.body.id;
    const root = req.user.roles.some(role => role === 'ADMIN')
    const result = await Question.findByIdAndUpdate(id, {status: 'ODOBRENO'});
    if(result){
        return res.send({
            success: true,
            error: undefined,
            data: undefined
        })
    }
    return res.send({
        success: false,
        error: undefined,
        data: undefined
    })
}

exports.unpublishQuestion = async (req, res, next) => {
    const id = req.body.id;
    const root = req.user.roles.some(role => role === 'ADMIN')
    const result = await Question.findByIdAndUpdate(id, {status: 'NA CEKANJU'});
    if(result){
        return res.send({
            success: true,
            error: undefined,
            data: undefined
        })
    }
    return res.send({
        success: false, 
        error: undefined,
        data: undefined
    })
}

exports.updateQuestionText = async (req, res, next) =>{
    const id = req.body.id;
    const text = req.body.text;
    const result = await Question.findByIdAndUpdate(id, {question: text, status: 'NA CEKANJU'});
    if(result){
        return res.send({
            success: true,
            error: undefined,
            data: undefined
        })
    }
    return res.send({
        success: false,
        error: undefined,
        data: undefined
    })  
}

exports.getAllQuestions = async (req, res, next) => {
    if(!req.user){
        return res.send({
            success: false,
            data: undefined,
            error: 'Something went wrong. Please login again.'
        })
    }
    const id = req.user._id.toString();
    const root = req.user.roles.some(role => role === 'ADMIN');
    const filter = req.params.filter;
    let questions;
    if (!id) {
        return res.json({
            sucess: false,
            message: messages.get_question_missing_id
        })
    }
    console.log(filter)
    if(!filter){
        questions = await Question.find();
    }else{
        questions = await Question.find({category: filter});
    }
    
    const questionsByOthers = [];

    questions.forEach( async (q, index) => {
        if(root){
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
    }else{
        return res.json({
            success: true,
            data: [],
            message: undefined
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
    const category = req.body.category.toUpperCase();
    const allAnswers = req.body.answers;
    const question = new Question({
        question: questionText,
        correct_letter: correct_letter,
        correct_text: correctText,
        posted_by: req.user._id.toString(),
        category: category,
        answers: allAnswers
    });
    await question.save();
    const userDoc = await Users.findById(req.user._id.toString());
    if(userDoc){
        const userCat = userDoc.categories.some(cat => cat.category === category);
        if(!userCat){
            userDoc.categories.push({category: category, questions_added: 1})
        }else{
            userDoc.categories.forEach(cat =>{
                if(cat.category === category){
                    cat.questions_added += 1;
                }
            })
        }
        await userDoc.save();
    }
    return res.send({
        success: true,
        error: undefined,
        data: undefined
    })
}

exports.uploadImage = async (req, res, next) => {

}

exports.addImageQuestion = async (req, res, next) =>{
    const questionText = req.body.question || 'Some question?';
    const correct_letter = req.body.correct_letter || 'B';
    const correctText = req.body.correct_text || 'Some correct answer';
    const imageUrl = req.body.imageUrl;
    if (!imageUrl) {
        return res.send({
            success: false
        })
    }
    const category = req.body.category.toUpperCase();
    const allAnswers = req.body.answers;
    const question = new Question({
        question: questionText,
        correct_letter: correct_letter,
        type: 'PICTURE',
        correct_text: correctText,
        imageUrl: imageUrl,
        posted_by: req.user._id.toString(),
        category: category,
        answers: allAnswers
    });
    await question.save();
    const userDoc = await Users.findById(req.user._id.toString());
    if (userDoc) {
        const userCat = userDoc.categories.some(cat => cat.category === category);
        if (!userCat) {
            userDoc.categories.push({ category: category, questions_added: 1 })
        } else {
            userDoc.categories.forEach(cat => {
                if (cat.category === category) {
                    cat.questions_added += 1;
                }
            })
        }
        await userDoc.save();
    }
    return res.send({
        success: true,
        error: undefined,
        data: undefined
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

exports.checkQuestion = async (req, res, next) =>{
    const userId = req.user._id;
    const correct = req.body.correct;
    const questionID = req.body.questionId;
    const user = await Users.findById(req.user._id);
    let category = '';
    Question.findById(questionID).then(question =>{
        if (question){
            if(correct){
                question.answered_correctly++;
                category = question.category;
            }else{
                question.answered_wrong++;
                category = question.category;
            }
            return question.save();
        }
    })
    .then(async () =>{
        if(user){
            let hasAchievement = user.achievements.some(achievement => achievement.category === category)
            if(!hasAchievement){
                user.achievements.push({
                    category: category,
                    answered: 1
                })
            }else{
                if(correct){
                    user.achievements.forEach(achievement =>{
                        if(achievement.category === category){
                            achievement.answered += 1;
                        }
                    })
                }
            }
    
            return user.save();
        }
    })
    .then(saved =>{
        return res.send({
            success: true,
            error: correct ? 'Correct' : 'Wrong',
            data: correct,
            user: user
        })
    })
}

exports.quizResults = async (req, res, next) =>{

}

exports.reduceLives = async (req, res, next) => {
    const id = req.user._id;
    let lives = 0;
    let userDoc = null;
    Users.findById(id).then(user =>{
        if(user){
            if(user.lives > 0){
                user.lives--;
                lives = user.lives;
                return user.save()
            }
            return user.save();
        }
    })
    .then(saved =>{
        if(saved){
            userDoc = saved;
        }
        return res.send({
            success: true,
            error: undefined,
            data: userDoc,
        })
    })
}