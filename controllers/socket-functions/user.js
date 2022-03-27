const User = require('../../db_models/user');
const EVENTS = require ('../socket-events');


function getRandomNumber(quantity) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(milliseconds * quantity / 1000);
}

exports.getRankingList = async (socket) =>{
    let users = await User.find();
    const rankedUsers = users.sort((a, b) => a.score > b.score);
    let top100;
    if(rankedUsers.length > 100){
            top100 = rankedUsers.splice(0, 100);
    }else{
            top100 = rankedUsers;
    }
    return socket.emit(EVENTS.GET_RANKING_LIST(), {event: EVENTS.GET_RANKING_LIST(), data: top100}) 
}

exports.resetDailyPrice = async (socket, data) => {
    const id = data.data._id;
    const user = await User.findById(id);
    const ticketPrice = [1,1,1,5,1,,1,1,2,1,1,1,3,1,1,1,2,1,1,1,10,1,1,1,3,1,1,1,4,1,1,1,2,1,1,1,4,1,1,1,2,1,1,1,3,1,1];
    const random = getRandomNumber(ticketPrice.length - 1);
    if (user) {
      const now = Date.now();
      if(now >= user.daily_price){ 
        const oneDay = 24 * 60 * 60 * 1000;
        user.tickets += ticketPrice[random];
        const tomorow = now + oneDay;
        user.daily_price = tomorow;
      }
      await user.save();
      return socket.emit(EVENTS.GET_DAILY_REWARD(), {event: EVENTS.GET_DAILY_REWARD(), data: user, tickets: ticketPrice[random]})
    }else{
      return socket.emit(EVENTS.GET_DAILY_REWARD(), {event: EVENTS.GET_DAILY_REWARD(), data: null, tickets: 0})
    }
}

exports.resetPlayingState = async (socket, data) =>{
    const user = await User.findById(data.data._id)
    user.playing = false;
    const saved = await user.save()
    if(saved){
       return socket.emit(EVENTS.RESET_PLAYING_STATE(), {event: EVENTS.RESET_PLAYING_STATE(), data: true})
    }
    return socket.emit(EVENTS.RESET_PLAYING_STATE(), {event: EVENTS.RESET_PLAYING_STATE(), data: false})
}

exports.resetLives = async (socket, data) => {
    const user = await User.findById(data.data._id)
    if(user){
        if(user.reset_lives_at > Date.now()){
            user.lives_timer_ms = Math.round((user.reset_lives_at - Date.now()) / 1000);
        }
            await user.save();
           socket.emit(EVENTS.RESET_LIVES(), {event: EVENTS.RESET_LIVES(), data: user})      
    }else{
        socket.emit(EVENTS.RESET_LIVES(), {event: EVENTS.RESET_LIVES(), data: null})  
    }


}


exports.updateScore = async (socket, data) =>{
    const score = data.score;
    const user = await User.findById(data.data._id);
    user.score = score;
    user.playing = false;
    const saved = await user.save();
    if(saved){
        return socket.emit(EVENTS.UPDATE_SCORE(), {data: true})
    }
    return socket.emit(EVENTS.UPDATE_SCORE(), {data: false})
}

exports.updateSettings = async (socket, data) =>{
    const name = data.settings.name;
    const avatar = data.settings.image || 'https://firebasestorage.googleapis.com/v0/b/kviz-live.appspot.com/o/1642193033985png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black.png?alt=media';
    const userDoc = await User.findById(data.data._id);
    if(userDoc){
        userDoc.name = name;
        userDoc.avatar_url = avatar
        userDoc.save();
        return socket.emit(EVENTS.UPDATE_SETTINGS(), {event: EVENTS.UPDATE_SETTINGS(), success: true, data: userDoc})
    }
    return socket.emit(EVENTS.UPDATE_SETTINGS(), {event: EVENTS.UPDATE_SETTINGS(), success: false, data: null})
 }

 exports.removeNotification = async (socket, data) =>{
    const user = await User.findById(data.data._id);
    if(user){
        user.requestNotification = false;
        await user.save();
        return socket.emit(EVENTS.REMOVE_NOTIFICATION(), {event: EVENTS.REMOVE_NOTIFICATION(), data: user, success: true})
    }
}