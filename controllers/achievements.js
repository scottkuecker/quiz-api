const Achievement = require('../db_models/achievement');

exports.getAchievements =  async (req, res, next) =>{
    const achievements = await Achievement.find();

    return res.send({
      success: true,
      achievements: achievements || []
    })
  }

  exports.createAchievements = (req, res, next) =>{

  }