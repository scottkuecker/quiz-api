const Users = require('../../db_models/user');
const EVENTS = require('../socket-events');

exports.inviteFriends = (io, socket, data) => {
    data.friends.forEach(friend => {
        io.in(`${friend._id}`).emit(EVENTS.TOURNAMENT_INVITATION(), { event: EVENTS.TOURNAMENT_INVITATION(), roomName: data.roomName, userName: data.userName })
    })
}


exports.addDBFriend = async (socket, data) => {
    const requested_friend_ID = data.friend_id;
    const my_id = data.user_id;
    const friend = await Users.findById(requested_friend_ID);
    if (friend) {
        const friend_requests = friend.friendRequests || [];
        if (!friend_requests.length || !friend_requests.includes(my_id)) {
            friend_requests.push(my_id);
            friend.friendRequests = friend_requests;
            friend.requestNotification = true;
            await friend.save();
            return socket.emit(EVENTS.ADD_FRIEND(), { event: EVENTS.ADD_FRIEND(), success: true })
        } else {
            return socket.emit(EVENTS.FRIEND_ALLREADY_REQUESTED(), { event: EVENTS.FRIEND_ALLREADY_REQUESTED() })
        }


    } else {
        return socket.emit(EVENTS.ADD_FRIEND(), { event: EVENTS.ADD_FRIEND(), success: false })
    }
}



exports.acceptDBFriend = async (socket, data) => {
    const requested_friend_ID = data.friend_id;
    const my_id = data.user_id;
    const friend = await Users.findById(requested_friend_ID);
    const me = await Users.findById(my_id);

    if (friend && me) {
        const my_friend_requests = me.friendRequests.filter(req_id => req_id !== requested_friend_ID);
        me.friendRequests = my_friend_requests;
        //if something fails, we want to reverse friends back to original
        const my_previous_friends = JSON.parse(JSON.stringify(me.friends)) || [];
        const friend_previous_friends = JSON.parse(JSON.stringify(friend.friends)) || [];
        //
        let my_friends = JSON.parse(JSON.stringify(my_previous_friends));
        let friend_friends = JSON.parse(JSON.stringify(friend_previous_friends));

        if (!my_friends.includes(requested_friend_ID)) {
            my_friends.push(requested_friend_ID);
        }
        if (!friend_friends.includes(my_id)) {
            friend_friends.push(my_id);
        }
        me.friends = my_friends;
        friend.friends = friend_friends;
        const my_result = await me.save();
        const friend_result = await friend.save();
        if (my_result && friend_result) {
            return socket.emit(EVENTS.ACCEPT_FRIEND(), { event: EVENTS.ACCEPT_FRIEND(), success: true, friendRequest: requested_friend_ID })
        } else {
            me.friends = previous_friends;
            friend.friends = friend_previous_friends;
            await me.save();
            await friend.save();
            return socket.emit(EVENTS.ACCEPT_FRIEND(), { event: EVENTS.ACCEPT_FRIEND(), success: false });
        }

    } else {
        return socket.emit(EVENTS.ACCEPT_FRIEND(), { event: EVENTS.ACCEPT_FRIEND(), success: false })
    }
}

exports.searchUsers = async (socket, data) =>{
    const filter = data.query.toUpperCase();
    let allUsers;
    allUsers = await Users.find();
    const users = allUsers.filter(user =>{
            if(user.name.toUpperCase().includes(filter)){
                return true;
            }
    })
        let top100;
        if(users.length > 100){
           top100 = users.splice(0, 100);
        }else{
            top100 = users;
        }

       const mapped = top100.map(user =>{
            return {
                name: user.name,
                avatar_url: user.avatar_url,
                _id: user._id,
                socket: user.socket,
                online: user.online || false
            }
        })
        return socket.emit(EVENTS.GET_ALL_USERS(), {event: EVENTS.GET_ALL_USERS(), data: mapped})

}


exports.getFriendRequests = async (socket, data) =>{
    const id = data.data._id;
    const me = await Users.findById(id);
    const my_requests = me.friendRequests || [];
    const allUsers = await Users.find();
    const requests = allUsers.filter(user =>{
        return my_requests.includes(user._id)
    });
    const mapped = requests.map(user =>{
        return{
            name: user.name,
            _id: user._id,
            avatar_url: user.avatar_url,
            socket: user.socket,
            online: user.online || false
        }
    });
    return socket.emit(EVENTS.GET_FRIEND_REQUESTS(), {event: EVENTS.GET_FRIEND_REQUESTS(), data: mapped})

}

exports.getFriendList = async (socket, data) => {
    const id = data.data._id;
    const me = await Users.findById(id);
    const my_friends = me.friends || [];
    const allUsers = await Users.find();
    const friends = allUsers.filter(user => {
        return my_friends.includes(user._id)
    });
    const mapped = friends.map(user => {
        return {
            name: user.name,
            _id: user._id,
            avatar_url: user.avatar_url,
            socket: user.socket || '123456',
            online: user.online || false
        }
    });
    return socket.emit(EVENTS.GET_FRIEND_LIST(), {event: EVENTS.GET_FRIEND_LIST(), data: mapped })
}

exports.removeFriend = async (req, res, next) => {
    const my_id = req.user._id;
    const remove_id = req.body.remove_id;
    if(my_id === remove_id){
        const me = await Users.findById(my_id);
        me.friends = me.friends.filter(friend_id => friend_id !== remove_id)
        await me.save();
        return res.send(
            {
                success: true,
                data: me.friends,
                error: undefined
            }
        )
    }
    const me = await Users.findById(my_id);
    const friend = await Users.findById(remove_id);

    me.friends = me.friends.filter(friend_id => friend_id !== remove_id)
    friend.friends = friend.friends.filter(friend_id => friend_id !== my_id);

    await me.save();
    await friend.save();
    return res.send(
        {
            success: true,
            data: me.friends,
            error: undefined
        }
    )

}
