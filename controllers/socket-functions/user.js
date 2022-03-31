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


exports.generateBots = async () => {
    const bot1 = new User({
        email: 'bot1@kviz-live.com',
        password: 'none',
        name: 'Jakov Ilic',
        title: 'Pocetnik 1',
        score: 3,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_1_fake_socket',
        is_bot:true,
        avatar_url: 'https://i.pinimg.com/474x/0a/42/7f/0a427f8c57082a1d1f0da6538acabf32--funny-animal-faces-hilarious-animals.jpg',
        questions: [],
        allready_answered: []
    });
    const bot2 = new User({
        email: 'bot2@kviz-live.com',
        password: 'none',
        name: 'Anica stanica',
        title: 'Pocetnik 2',
        score: 5,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_2_fake_socket',
        is_bot: true,
        avatar_url: 'https://firebasestorage.googleapis.com/v0/b/kviz-live.appspot.com/o/1642193033985png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black.png?alt=media',
        questions: [],
        allready_answered: []
    });
    const bot3 = new User({
        email: 'bot3@kviz-live.com',
        password: 'none',
        name: 'Frizider Vucic',
        title: 'Pocetnik 3',
        score: 6,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_3_fake_socket',
        is_bot: true,
        avatar_url: 'https://www.nedeljnik.rs/wp-content/uploads/2020/01/Vucic-Tan2019-12-31_105040123_2.jpg',
        questions: [],
        allready_answered: []
    });
    const bot4 = new User({
        email: 'bot4@kviz-live.com',
        password: 'none',
        name: 'Lana',
        title: 'Pocetnik 4',
        score: 9,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_4_fake_socket',
        is_bot: true,
        avatar_url: 'https://firebasestorage.googleapis.com/v0/b/kviz-live.appspot.com/o/1642193033985png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black.png?alt=media',
        questions: [],
        allready_answered: []
    });
    const bot5 = new User({
        email: 'bot5@kviz-live.com',
        password: 'none',
        name: 'Danilo',
        title: 'Pocetnik 5',
        score: 16,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_5_fake_socket',
        is_bot: true,
        avatar_url: 'https://ae01.alicdn.com/kf/HTB1619iNpXXXXXJaXXXq6xXFXXXG/small-cute-simulation-cat-polyethylene-fur-lovely-cat-model-in-a-basket-gift-about-12x10cm116.jpg_Q90.jpg_.webp',
        questions: [],
        allready_answered: []
    });
    const bot6 = new User({
        email: 'bot6@kviz-live.com',
        password: 'none',
        name: 'Konstantin',
        title: 'Pocetnik 6',
        score: 17,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_6_fake_socket',
        is_bot: true,
        avatar_url: 'https://beoshoppingcenter.rs/wp-content/uploads/2020/02/konstantin.jpg',
        questions: [],
        allready_answered: []
    });
    const bot7 = new User({
        email: 'bot7@kviz-live.com',
        password: 'none',
        name: 'Matija',
        title: 'Pocetnik 7',
        score: 19,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_7_fake_socket',
        is_bot: true,
        avatar_url: 'https://bigsee.eu/wp-content/uploads/2019/10/matijacop-portret.jpg',
        questions: [],
        allready_answered: []
    });
    const bot8 = new User({
        email: 'bot8@kviz-live.com',
        password: 'none',
        name: 'Iskra',
        title: 'Pocetnik 8',
        score: 22,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_8_fake_socket',
        is_bot: true,
        avatar_url: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/iskra-lawrence-scary-birth-labour-story-details-new-baby-picture-1587725217.jpg',
        questions: [],
        allready_answered: []
    });
    const bot9 = new User({
        email: 'bot9@kviz-live.com',
        password: 'none',
        name: 'El Preto',
        title: 'Pocetnik 9',
        score: 37,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_9_fake_socket',
        is_bot: true,
        avatar_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVFdxsxEbFoZdRatbWw0NhUZ9qix5QtBvdAw&usqp=CAU',
        questions: [],
        allready_answered: []
    });
    const bot10 = new User({
        email: 'bot10@kviz-live.com',
        password: 'none',
        name: 'Haus aus Papier',
        title: 'Pocetnik 10',
        score: 49,
        lives: 3,
        tickets: 10,
        roles: ['USER', 'BOT'],
        achievements: [],
        room: '',
        online: true,
        socket: 'bot_10_fake_socket',
        is_bot: true,
        avatar_url: 'http://dzabaletan.com/wp-content/uploads/2019/09/La-Casa-de-Papel.jpg',
        questions: [],
        allready_answered: []
    });
    await bot1.save();
    await bot2.save();
    await bot3.save();
    await bot4.save();
    await bot5.save();
    await bot6.save();
    await bot7.save();
    await bot8.save();
    await bot9.save();
    await bot10.save();
    console.log('finished with bots')
}