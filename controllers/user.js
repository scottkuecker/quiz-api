const User = require('../db_models/user');
const Achievements = require('../db_models/achievement');
const Questions = require('./questions');

function getRandomNumber(quantity) {
    var milliseconds = new Date().getMilliseconds();
    return Math.floor(milliseconds * quantity / 1000);
}

exports.resetPlayingState = async (req, res, next) =>{
    const user = await User.findById(req.user._id)
    user.playing = false;
    const saved = await user.save()
    if(saved){
        res.send({
            success: true,
            data: user,
            error: undefined
        })
    }
}

exports.resetDailyPrice = async (req, res, next) => {
    const id = req.user._id;
    const user = await User.findById(id);
    const ticketPrice = [1,5,1,2,3,1,2,1,1,10,1,1,3,1,4,2,1,4,1,2,3,1,1];
    const random = getRandomNumber(ticketPrice.length - 1);
    if (user) {
      const now = Date.now();
      if(now >= user.daily_price){ 
        // const oneDay = 24 * 60 * 60 * 1000;
        const oneDay = 60 * 1000;
        user.tickets += ticketPrice[random];
        const tomorow = now + oneDay;
        user.daily_price = tomorow;
      }
      await user.save();
      return res.send({
        success: true,
        data: user,
        tickets: ticketPrice[random],
        error: ''
      })
    }else{
        return res.send({
            success: false,
            data: null,
            error: 'Doslo je do greske, pokusajte ponovo'
          })
    }
}

exports.resetLives = async (req, res, next) => {
    const user = await User.findById(req.user._id)
    if(user){
        if(user.reset_lives_at > Date.now()){
            user.lives_timer_ms = Math.round((user.reset_lives_at - Date.now()) / 1000);
        }
            await user.save();
            return res.send({
                success: true,
                data: user,
                error: ''
            })      
    }else{
        res.send({
            success: false,
            data: undefined,
            error: undefined
        })
    }


}


exports.updateScore = async (req, res, next) =>{
    const score = req.body.score;
    const user = await User.findById(req.user._id);
    user.score = score;
    user.playing = false;
    const saved = await user.save();
    if(saved){
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

exports.updateSettings = async (req, res, next) =>{
    const name = req.body.name;
    const avatar = req.body.image || 'https://firebasestorage.googleapis.com/v0/b/kviz-live.appspot.com/o/1642193033985png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black.png?alt=media';
    const userDoc = await User.findById(req.user._id);
    if(userDoc){
        userDoc.name = name;
        userDoc.avatar_url = avatar
        userDoc.save();
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

 exports.getRankingList = async (req, res, next) =>{
     const filter = req.body.filter;
     let users;
     if(!filter){
         users = await User.find();
     }else{
         users = await User.find({score: {$lt: filter + 1}});
     }
         const rankedUsers = users.sort((a, b) => a.score > b.score);
         let top100;
         if(rankedUsers.length > 100){
            top100 = rankedUsers.splice(0, 100);
         }else{
             top100 = rankedUsers;
         }
         return res.send({
             success: true,
             data: top100,
             error: undefined
         })
     
    
 }
