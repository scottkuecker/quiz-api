const User = require('../db_models/user');

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