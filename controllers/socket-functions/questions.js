const Room = require('../../db_models/rooms');
const EVENTS = require('../socket-events');
const Questions = require('../../db_models/question');


function getRandomNumber(quantity) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(Math.random(Math.floor(milliseconds * quantity / 1000)) * quantity)
}

exports.getDBQuestion = async (socket, data) => {
    const tournamentRoom = await Room.findOne({ room_id: data.roomName });
    if (!tournamentRoom || !tournamentRoom.allow_enter) {
        socket.emit(`${EVENTS.ROOM_DONT_EXIST()}`, {
            event: EVENTS.ROOM_DONT_EXIST(),
            fn: `getDBQuestion()|requestedRoom:${data.roomName}|respondedRoom: ${tournamentRoom.room_id}|allow: ${tournamentRoom.allow_enter}`
        });
    }
    socket.emit(EVENTS.GET_ROOM_QUESTION(), { event: EVENTS.GET_ROOM_QUESTION(), question: tournamentRoom.questions[data.questionIndex] })
    return true
}

exports.generateRoomQuestions = async (roomName, amount, usersArr) => {
    const tournamentRoom = await Room.findOne({ room_id: roomName });
    const amountOfQuestions = amount;

    const questions = await Questions.find({ status: 'ODOBRENO' });
    const room_questions = [];

    
    async function generateQuestions() {
        return new Promise((resolve, reject) => {
            function generate() {
                if (room_questions.length <= amountOfQuestions) {
                    setTimeout(() => {
                        let filtered = questions.filter(quest => {
                            if (room_questions.some(q => q._id === quest._id)) {
                                return false;
                            } else {
                                return true;
                            }
                        })
                        let random = getRandomNumber(filtered.length);
                        let question = filtered[random];
                        room_questions.push(question);
                        generate();
                    }, Math.round(Math.random()) * 10)

                } else {
                    resolve(true)
                }
            }
            generate()
        })

    }
    await generateQuestions();
    tournamentRoom.questions = room_questions;
    tournamentRoom.users = usersArr;
    await tournamentRoom.save();
}



exports.getQuestion = async (socket, data) => {
    const id = data.data._id;
    const user = await Users.findById(id);
    user.allready_answered = user.allready_answered || [];
    const category = req.params.category;
    user.playing = true;
    await user.save();
    if (!id) {
        return // no id for question found
    }
    let questions;
    if (category && category !== 'RAZNO') {
        questions = await Question.find({ status: 'ODOBRENO', category: category });
    } else {
        questions = await Question.find({ status: 'ODOBRENO' });
    }

    let questionsByOthers = [];
    questions.forEach(q => {
        if (q._id.toString() !== id) {
            questionsByOthers.push(q);
        }
    });
    questionsByOthers = questionsByOthers.filter(question => !user.allready_answered.includes(question._id));
    if (!questionsByOthers.length) {
        questions.forEach(q => {
            if (q._id.toString() !== id) {
                questionsByOthers.push(q);
            }
        });
        user.allready_answered = [];
        await user.save()
    }
    let random = getRandomNumber(questionsByOthers.length);
    if (questionsByOthers && questionsByOthers.length) {
        let picked = JSON.parse(JSON.stringify(questionsByOthers[random]));
        user.allready_answered.push(picked._id)
        await user.save();
        picked.correct_text = 'Ma da neces odgovor mozda :)';
        picked.correct_letter = 'Saznaces nakon sto izaberes';
        let timesPicked = picked.question_picked + 1;
        let difficulty = parseInt((picked.answered_correctly / timesPicked) * 100);
        await Question.findByIdAndUpdate({ _id: picked._id.toString() }, { question_picked: timesPicked, question_difficulty: difficulty });
        socket.emit(EVENTS.GET_QUESTION(), { event: EVENTS.GET_QUESTION(), data: picked })
    } else {
        return //empty question list
    }

}

exports.publishQuestion = async (socket, data) => {
    const id = data.data.id;
    const root = req.user.roles.some(role => role === 'ADMIN')
    const result = await Question.findByIdAndUpdate(id, { status: 'ODOBRENO' });
    if (result) {
        return socket.emit(EVENTS.PUBLISH_QUESTION(), { event: EVENTS.PUBLISH_QUESTION(), data: true })
    }
    return socket.emit(EVENTS.PUBLISH_QUESTION(), { event: EVENTS.PUBLISH_QUESTION(), data: false })
}

exports.unpublishQuestion = async (socket, data) => {
    const id = data.data.id;
    const root = req.user.roles.some(role => role === 'ADMIN')
    const result = await Question.findByIdAndUpdate(id, { status: 'NA CEKANJU' });
    if (result) {
        return socket.emit(EVENTS.UNPUBLISH_QUESTION(), { event: EVENTS.UNPUBLISH_QUESTION(), data: true })
    }
    return socket.emit(EVENTS.UNPUBLISH_QUESTION(), { event: EVENTS.UNPUBLISH_QUESTION(), data: false })
}

exports.updateQuestionText = async (socket, data) => {
    const id = data.data.id;
    const text = data.data.text;
    const result = await Question.findByIdAndUpdate(id, { question: text, status: 'NA CEKANJU' });
    if (result) {
        return socket.emit(EVENTS.UPDATE_QUESTION_TEXT(), { event: EVENTS.UPDATE_QUESTION_TEXT(), data: true })
    }
    return socket.emit(EVENTS.UPDATE_QUESTION_TEXT(), { event: EVENTS.UPDATE_QUESTION_TEXT(), data: false })
}

exports.getAllQuestions = async (socket, data) => {
    
    const id = data.data._id;
    const root = data.data.roles.some(role => role === 'ADMIN');
    const filter = data.filter;
    console.log(id, root, filter)
    let questions;
    if (!filter) {
        if (root) {
            questions = await Questions.find();
        } else {
            questions = await Questions.find({ posted_by: id });
        }

    } else {
        if (root) {
            questions = await Questions.find({ category: filter });
        } else {
            questions = await Questions.find({ posted_by: id, category: filter });
        }
    }
    if (questions.length) {
        socket.emit(EVENTS.GET_QUESTIONS(), { event: EVENTS.GET_QUESTIONS(), data: questions })
    } else {
        socket.emit(EVENTS.GET_QUESTIONS(), { event: EVENTS.GET_QUESTIONS(), data: [] })
    }
}

exports.addQuestion = async (socket, data) => {
    const questionText = data.question.question || 'Pitanje sa slikom';
    const correct_letter = data.question.correct_letter || 'B';
    const correctText = data.question.correct_text || 'Some correct answer';
    const category = data.question.category.toUpperCase();
    const allAnswers = data.question.answers;
    const imageUrl = data.question.imageUrl;
    const type = data.question.type;
    const id = data._id.toString();
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
    const userDoc = await Users.findById(data.data._id.toString());
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
    socket.emit(EVENTS.ADD_QUESTION(), {event: EVENTS.ADD_QUESTION(), data: true})
}