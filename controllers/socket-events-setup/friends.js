
const socketCon = require('../../socket');
const EVENTS = require('../socket-events');
const FRIEND_REQUESTS = require('../socket-functions/friend-requests');
const midleware = require('../../midleware/auth');

exports.setup = () => {
    const socketIo = socketCon.getIO();
    socketIo.on('connection', socket => {

        socket.on(EVENTS.GET_ALL_USERS(), async data => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.searchUsers);
        });
        socket.on(EVENTS.GET_FRIEND_LIST(), async data => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.getFriendList)
        });

        socket.on(EVENTS.GET_FRIEND_REQUESTS(), async data => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.getFriendRequests)
        })

        socket.on(EVENTS.REMOVE_FRIEND(), async data => {
            midleware.socketMiddleware(socket, data, FRIEND_REQUESTS.removeFriend)
        })

        socket.on(EVENTS.ADD_FRIEND(), data => {
            FRIEND_REQUESTS.addDBFriend(socket, data)
        })

        socket.on(EVENTS.ACCEPT_FRIEND(), data => {
            FRIEND_REQUESTS.acceptDBFriend(socket, data)
        });

        socket.on(EVENTS.INVITE_FRIENDS(), (data) => {
            FRIEND_REQUESTS.inviteFriends(socketIo, socket, data);
        });
      
    })
}