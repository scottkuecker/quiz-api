const Achievement = require('../db_models/achievement');
const User = require('../db_models/user');

exports.getAchievements =  async (req, res, next) =>{
    const achievements = await Achievement.find();
    const user = await User.findById(req.user._id);
    const userAchievements = user.achievements
    const modifiedAchievements = [];
    user.notifications.achievements = false;
    await user.save()
      if (achievements && achievements.length && userAchievements && userAchievements.length){
        for(let i = 0; i < userAchievements.length; i++){
          for(let j = 0; j < achievements.length; j++){
            if(userAchievements[i].category === achievements[j].category){
              modifiedAchievements.push({
                category: achievements[j].category,
                achiveText: achievements[j].achiveText,
                achievedAt: achievements[j].achievedAt,
                answered: userAchievements[i].answered,
                price_received: userAchievements[i].answered > achievements[j].achievedAt
              })
            }
          }
        }
        // console.log(modifiedAchievements)
        return res.send({
          success: true,
          data: modifiedAchievements || [],
          error: ''
        })

      }else{
          return res.send({
            success: false,
            data: [],
            error: ''
         })
    }
  }

  exports.createAchievements = (req, res, next) =>{

  }