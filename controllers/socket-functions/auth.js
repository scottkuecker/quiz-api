const User = require('../../db_models/user');
const Achievements = require('../../db_models/achievement');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oneOnOneRoom = require('../../db_models/one-on-one');
const EVENTS = require('../socket-events');

exports.signUp = async (socket, data) =>{
    const email = data.email;
    const password = data.password;
    if(!password){
        return;
    }
    const user = await User.findOne({email: email});
    if(user){
          return //allready exist
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if(hashedPassword){
        const user = new User({
            email: email,
            password: hashedPassword,
            reset_daily_price: Date.now() + 60 * 60 * 1000,
            roles: ['USER'],
            contributions: [],
            questions: []

        });
       user.save();
       return socket.emit(EVENTS.REGISTER(), {event: EVENTS.REGISTER(), data: true})
    }
}

exports.login = async (socket, data) => {
    const email = data.email;
    const password = data.password;
    const userDoc = await User.findOne({ email: email });
    if (!userDoc) {
        return;
    }
        bcrypt.compare(password, userDoc.password).then(async doMatch =>{
            if (doMatch) {
                const dataToSign = {
                    email: userDoc.email,
                    _id: userDoc._id,
                    password: userDoc.password,
                    roles: userDoc.roles
                }
                const token = jwt.sign({ user: dataToSign }, process.env.SIGNING_SECRET, { expiresIn: '24h' });
                const oneOnOne = await oneOnOneRoom.findOne({ room_id: '1on1'})
                let users = oneOnOne.users || [];
                users = users.filter(id => id !== userDoc._id)
                oneOnOne.users = users;
                await oneOnOne.save();
                const data = {
                    data: userDoc,
                    token: token
                }
                return socket.emit(EVENTS.LOGIN(), {event: EVENTS.LOGIN(), data: data})

            } else {
                return ;
            }
        });
}

exports.autoLogin = async (socket, data) => {
    const email = data.data.email;
    const user = await User.findOne({ email: email });
    if (!user) {
        socket.emit(EVENTS.AUTOLOGINFAILED(), { event: EVENTS.AUTOLOGINFAILED(), data: null })
        return;
    }
    return socket.emit(EVENTS.AUTOLOGIN(), { event: EVENTS.AUTOLOGIN(), data: user })
}

exports.facebookLogin = async (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    const userDoc = await User.findOne({ fbId: id });
    let token;
    if (userDoc) {
        token = jwt.sign({ user: userDoc }, process.env.SIGNING_SECRET, { expiresIn: '24h' });
            return res.send({
                success: true,
                error: '',
                data: userDoc,
                token
            })
    }else{
        const newUser = new User({
            fbId: id,
            name
        })
        await newUser.save();
        token = jwt.sign({ user: newUser }, process.env.SIGNING_SECRET, { expiresIn: '3h' })
        return res.send({
            success: true,
            error: '',
            data: newUser,
            token
        })
    }
}

exports.refresh = async (socket, data) => {
    if (data.data._id) {
        const userDoc = await User.findOne({ _id: data.user_id });
        const achievements = await Achievements.find();
        if (userDoc) {
            for (let i = 0; i < userDoc.achievements.length; i++) {
                for (let j = 0; j < achievements.length; j++) {
                    if (!userDoc.achievements[i].achievement_ticket_ids.includes(achievements[j]._id.toString()) &&
                        userDoc.achievements[i].answered >= achievements[j].achievedAt && 
                        userDoc.achievements[i].category === achievements[j].category) {

                        userDoc.achievements[i].achievement_ticket_ids.push(achievements[j]._id.toString());
                        userDoc.tickets += 1;
                        userDoc.notifications.achievements = true;
                    }
                }
            }
            if (userDoc.lives === 0 && userDoc.lives_reset_timer_set && userDoc.reset_lives_at <= Date.now()){
                userDoc.lives = 1;
                userDoc.lives_reset_timer_set = false;
            }
            if(userDoc.reset_lives_at > Date.now()){
                userDoc.lives_timer_ms = Math.round((userDoc.reset_lives_at - Date.now()) / 1000);
            }
            await userDoc.save();
            return socket.emit(EVENTS.REFRESH_USER(), {event: EVENTS.REFRESH_USER(), data: userDoc})
        }
    }
}

exports.takeDailyPrice = async (socket, data) =>{

    const user = User.findById(data.data._id);
        if (!user){
            return 
        }
        if (!user.daily_price){
            return ;
        }
   
    user.tickets++;
    user.daily_price = false;
    const success = await user.save();
    if(success){
        return socket.emit(EVENTS.DAILY_PRICE(), {event: EVENTS.DAILY_PRICE(), data: true})
    }
}
