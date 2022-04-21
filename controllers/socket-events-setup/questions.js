const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const QUESTIONS = require('../socket-functions/questions');
const midleware = require('../../midleware/auth');

exports.setup = () => {
    const socketIo = socketCon.getIO();
    console.log('question listeners ready')
    socketIo.on('connection', socket => {


        socket.on(EVENTS.ADD_QUESTION(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.addQuestion)
        })

        socket.on(EVENTS.GET_QUESTION(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.getQuestion)
        })

        socket.on(EVENTS.GET_QUESTIONS(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.getAllQuestions)
        });

        socket.on(EVENTS.CHECK_QUESTION(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.checkQuestion)
        })

        socket.on(EVENTS.DELETE_QUESTION(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.deleteQuestion)
        });

        socket.on(EVENTS.CHECK_PRACTICE_QUESTION(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.checkQuestion)
        })

    })
}