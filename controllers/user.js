const User = require('../db_models/user');
const Achievements = require('../db_models/achievement');
const Questions = require('./questions');

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

exports.resetLives = (req, res, next) => {
    let userDoc;
    let sent = false;
    User.findById(req.user._id).then(user =>{
        if(user){
            user.lives = 3;
            userDoc = user;
            return user.save()
        }else{
            userDoc = req.body.user;
            sent = true;
            return res.send({
                success: false,
                data: userDoc,
                error
            })
        }
    })
    .then(saved =>{
        if(!sent){
            return res.send({
                success: true,
                data: userDoc,
                error: undefined
            })
        }
        return;
    })
    .catch(error =>{
        if(!sent){
            return res.send({
                success: true,
                data: undefined,
                error: undefined
            })
        }
    })

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

exports.updateName = async (req, res, next) =>{
    const name = req.body.name;
    const userDoc = await User.findById(req.user._id);
    if(userDoc){
        userDoc.name = name;
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

exports.takeDailyPrice = async (req, res, next) =>{
    const user = await User.findById(req.user._id);
    let success;
    let userDoc;
    if (user && user.daily_price){
        user.tickets++;
        user.daily_price = false;
        userDoc = user;
        success = await user.save();
        if(success){
            return res.send({
                success: true,
                data: userDoc,
                error: undefined
            })
        }
    }
    return res.send({
        success: false,
        data: undefined,
        error: 'reward allready claimed'
    })


}

