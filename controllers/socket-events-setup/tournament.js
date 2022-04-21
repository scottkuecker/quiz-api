const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const TOURNAMENT = require('../socket-functions/tournament');
const midleware = require('../../midleware/auth');

exports.setup = () => {
    const socketIo = socketCon.getIO();
    console.log('tournament listeners ready')
    socketIo.on('connection', socket => {
        socket.on(EVENTS.OPONENT_ACCEPTED(), (data) => {
            midleware.socketMiddleware(socket, data, TOURNAMENT.acceptDBOponent)
        });

        socket.on(EVENTS.OPONENT_DECLINED(), (data) => {
            midleware.socketMiddleware(socket, data, TOURNAMENT.declineOponent)
        });


        socket.on(EVENTS.START_TOURNAMENT(), data => {
            TOURNAMENT.startDBTournament(socketIo, socket, data)
        })

        socket.on(EVENTS.SELECTED_QUESTION_LETTER(), data => {
            TOURNAMENT.checkDBTournamentQuestion(socketIo, socket, data)
        });


    })
}