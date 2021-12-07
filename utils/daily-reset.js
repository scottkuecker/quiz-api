const Users = require('../db_models/user');

const day = {
    miliseconds: 86400000,
    testReset: 20000
}

const resetDailyPrice = async () => {
    const users = await Users.find();
    if (users.length) {
        users.forEach(async user => {
            user.daily_price = true;
            await user.save();
        });
       
    }
}


exports.initiDailiReset = () =>{
    setInterval(reset=>{
        resetDailyPrice();
    }, day.miliseconds)
}