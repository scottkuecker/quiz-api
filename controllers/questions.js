const Question = require('../db_models/question');
const Users = require('../db_models/user');
const messages = require('../messages');
const Validators = require('../utils/validations');

function getRandomNumber(quantity) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(milliseconds * quantity / 1000);
}

exports.getQuestion = async (req, res, next) => {
    const id = req.user._id;
    const user = await Users.findById(req.user._id);
    user.allready_answered = user.allready_answered || [];
    const category = req.params.category;
    user.playing = true;
    await user.save();
    if(!id){
        return res.json({
            sucess: false,
            message: messages.get_question_missing_id
        })
    }
    let questions;
    if(category && category !== 'RAZNO'){
        questions = await Question.find({ status: 'ODOBRENO', category: category });
    }else{
        questions = await Question.find({ status: 'ODOBRENO' });
    }
   
    let questionsByOthers = [];
    questions.forEach(q =>{
        if(q._id.toString() !== id){
            questionsByOthers.push(q);
        }
    });
    questionsByOthers = questionsByOthers.filter(question => !user.allready_answered.includes(question._id));
    if (!questionsByOthers.length){
        questions.forEach(q => {
            if (q._id.toString() !== id) {
                questionsByOthers.push(q);
            }
        });
        user.allready_answered = [];
        await user.save()
    }
    let random = getRandomNumber(questionsByOthers.length);
    if (questionsByOthers && questionsByOthers.length){
        let picked = JSON.parse(JSON.stringify(questionsByOthers[random]));
        user.allready_answered.push(picked._id)
        await user.save();
        picked.correct_text = 'Ma da neces odgovor mozda :)';
        picked.correct_letter = 'Saznaces nakon sto izaberes';
        let timesPicked = picked.question_picked + 1;
        let difficulty = parseInt((picked.answered_correctly / timesPicked) * 100);
        await Question.findByIdAndUpdate({ _id: picked._id.toString() }, { question_picked: timesPicked, question_difficulty: difficulty});
        return res.json({
            success: true,
            data: picked,
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
    const id = req.user._id.toString();
    const root = req.user.roles.some(role => role === 'ADMIN');
    const filter = req.params.filter;
    let questions;
    if(!filter){
        if(root){
            questions = await Question.find();
        }else{
            questions = await Question.find({posted_by: id});
        }
       
    }else{
        if (root) {
            questions = await Question.find({ category: filter });
        } else {
            questions = await Question.find({ posted_by: id, category: filter  });
        }
    }
    if (questions.length) {
        return res.json({
            success: true,
            data: questions,
            message: ''
        })
    }else{
        return res.json({
            success: true,
            data: [],
            message: undefined
        })
    }
}

exports.addQuestion = async (req, res, next) =>{
    const questionText = req.body.question || 'Pitanje sa slikom';
    const correct_letter = req.body.correct_letter || 'B';
    const correctText = req.body.correct_text || 'Some correct answer';
    const category = req.body.category.toUpperCase();
    const allAnswers = req.body.answers;
    const imageUrl = req.body.imageUrl;
    const type = req.body.type;
    const id = req.user._id.toString();
    const question = new Question({
        question: questionText,
        correct_letter: correct_letter,
        correct_text: correctText,
        posted_by: id,
        category: category,
        answers: allAnswers,
        imageUrl: imageUrl,
        type: type
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

exports.addFastQuestion = async (req, res, next) => {

    try{
        const questionText = req.body.question_text || 'Some question?';
        const correct_letter = req.body.correct_letter || 'B';
        const correctText = req.body.correct_text || 'Some correct answer';
        const allAnswers = req.body.answers || [];

        const question = new Question({
                question: questionText,
                correct_letter: correct_letter,
                correct_text: correctText,
                category: 'ISTORIJA',
                answers: [
                    { letter: 'A', text: allAnswers[0]},
                    { letter: 'B', text: allAnswers[1] },
                    { letter: 'C', text: allAnswers[2] },
                    { letter: 'D', text: allAnswers[3] }
                ],
            });
        await question.save();
        return res.send({
            success: true,
            error: undefined,
            data: undefined
        })
    }catch(e){
        res.status(404);
        return res.send({
            success: false,
            data: req.body,
            error: e,
            data: undefined
        })
    }

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
    const userPick = req.body.correct;
    const questionID = req.body.questionId;
    let correct = false;
    const user = await Users.findById(req.user._id);
    let category = '';
    Question.findById(questionID).then(question =>{
        if (question){
            if(userPick === question.correct_text){
                correct = true;
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
    let lives_timer_ms = 0;
    Users.findById(id).then(user =>{
        if(user){
            if(user.lives > 0){
                user.lives--;
                if (user.lives === 0 && !user.lives_reset_timer_set){
                    let now = Date.now();
                    let future = now + 122000;
                    user.lives_timer_ms = future - now;
                    user.reset_lives_at = future;
                    user.lives_reset_timer_set = true;
                }
                if(user.reset_lives_at > Date.now()){
                    user.lives_timer_ms = user.reset_lives_at - Date.now();
                }
                return user.save()
            }
            if(user.reset_lives_at > Date.now()){
                user.lives_timer_ms = Math.round((user.reset_lives_at - Date.now()) / 1000);
            }
            return user.save();
        }
    })
    .then(saved =>{
        return res.send({
            success: true,
            error: undefined,
            data: saved,
        })
    })
}
