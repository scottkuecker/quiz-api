const User = require('../db_models/user');

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
                user: userDoc
            })
        }
    })
    .then(saved =>{
        if(!sent){
            return res.send({
                success: true,
                user: userDoc
            })
        }
        return;
    })
    .catch(error =>{
        if(!sent){
            return res.send({
                success: true,
                user: null
            })
        }
    })

}
exports.updateScore = async (req, res, next) =>{
   const score = req.body.score;
   const userDoc = await User.findById(req.user._id);
   if(userDoc){
       userDoc.score = score;
       userDoc.save();
       return res.send({
           success: true
       })
   }
   return res.send({
    success: false
    })

}

exports.updateName = async (req, res, next) =>{
    const name = req.body.name;
    const userDoc = await User.findById(req.user._id);
    if(userDoc){
        userDoc.name = name;
        userDoc.save();
        return res.send({
            success: true
        })
    }
    return res.send({
     success: false
     })
 
 }