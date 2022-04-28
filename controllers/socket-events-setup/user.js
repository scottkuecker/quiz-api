const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const QUESTIONS = require('../socket-functions/questions');
const AUTH = require('../socket-functions/auth');
const USERS = require('../socket-functions/user');
const ACHIEVEMENTS = require('../socket-functions/achievements');
const midleware = require('../../midleware/auth');

exports.setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', socket => {

        socket.on(EVENTS.GET_RANKING_LIST(), async data => {
            midleware.socketMiddleware(socket, data, USERS.getRankingList)
        })

        socket.on(EVENTS.GET_DAILY_REWARD(), async data => {
            midleware.socketMiddleware(socket, data, USERS.resetDailyPrice)
        })

        socket.on(EVENTS.RESET_PLAYING_STATE(), async data => {
            midleware.socketMiddleware(socket, data, USERS.resetPlayingState)
        })

        socket.on(EVENTS.RESET_LIVES(), async data => {
            midleware.socketMiddleware(socket, data, USERS.resetLives)
        })
        socket.on(EVENTS.UPDATE_SCORE(), async data => {
            midleware.socketMiddleware(socket, data, USERS.updateScore)
        })

        socket.on(EVENTS.UPDATE_SETTINGS(), async data => {
            midleware.socketMiddleware(socket, data, USERS.updateSettings)
        })

        socket.on(EVENTS.REMOVE_NOTIFICATION(), async data => {
            midleware.socketMiddleware(socket, data, USERS.removeNotification)
        });

        socket.on(EVENTS.REDUCE_LIVES(), async data => {
            midleware.socketMiddleware(socket, data, QUESTIONS.reduceLives)
        })

        socket.on(EVENTS.GET_ACHIEVEMENTS(), async data => {
            midleware.socketMiddleware(socket, data, ACHIEVEMENTS.getAchievements)
        });

        socket.on(EVENTS.REFRESH_USER(), data => {
            midleware.socketMiddleware(socket, data, AUTH.refresh)
        })

        socket.on(EVENTS.AUTOLOGIN(), async data => {
            midleware.socketMiddleware(socket, data, AUTH.autoLogin);
        });
        

    })
}