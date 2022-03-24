const Achievement = require('../db_models/achievement');
const User = require('../db_models/user');
const EVENTS = require('../controllers/socket-events');

exports.getAchievements =  async (socket, data) =>{
    const achievements = await Achievement.find();
    const user = await User.findById(data.data._id);
    const userAchievements = user.achievements;
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
        socket.emit(EVENTS.GET_ACHIEVEMENTS(), { event: EVENTS.GET_ACHIEVEMENTS(), data: modifiedAchievements || []})

      }else{
        socket.emit(EVENTS.GET_ACHIEVEMENTS(), { event: EVENTS.GET_ACHIEVEMENTS(), data: [] })
    }
  }

  exports.createAchievements = async (req, res, next) =>{
    // const achScores = [30, 60, 100, 200, 500, 1000, 5000, 10000]
    // let counter = 0;
    // function save(){
    //   return new Promise((resolve, reject) =>{
    //     let ach = new Achievement({
    //       category: "RAZNO",
    //       achiveText: `${achScores[counter]} pogodjenih pitanja`,
    //       achievedAt: achScores[counter]
    //     })
    //     ach.save().then(()=>{
    //       counter++
    //       console.log('saved')
    //       resolve(true)
    //     })
    //   })
    // }

    // async function next(){
    //   console.log('triggering')
    //   await save();
    //   console.log('after save')
    //   if(counter <= achScores.length - 1){
    //     next();
    //   }
    // }

    // next();
  }