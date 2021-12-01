const User = require('../db_models/user');
const Achievements = require('../db_models/achievement');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const environment = require('../environment');

exports.signUp = async (req, res, next) =>{
    const email = req.body.email;
    const password = req.body.password;
    if(!password){
        return res.send({
            success: false,
            data: undefined,
            error: 'Password is required'
        });
    }
    const user = await User.findOne({email: email});
    if(user){
          return res.send({
               success: false,
               data: undefined,
               error: 'User allready exist'
           });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if(hashedPassword){
        const user = new User({
            email: email,
            password: hashedPassword,
            roles: ['USER'],
            contributions: [],
            questions: []

        });
       user.save();
       return res.send({
            success: true,
            data: undefined,
            error: ''
        });
    }
    return res.send({
        success: false,
        data: undefined,
        error: 'Something went wrong'
    })
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const userDoc = await User.findOne({ email: email });
    if (!userDoc) {
        return res.json({
            success: false,
            data: undefined,
            error: 'No user found'
        })
    }
        bcrypt.compare(password, userDoc.password).then(doMatch =>{
            if (doMatch) {
                const token = jwt.sign({ user: userDoc }, environment.signingSecret, { expiresIn: '3h' })
                return res.status(200).json({
                    data: userDoc,
                    token: token,
                    success: true,
                    error: undefined
                })
            } else {
                res.send({
                    success: false,
                    data: undefined,
                    error: 'Email or password did not match'
                })
            }
        });
}

exports.autoLogin = async (req, res, next) => {
    if(req.user){
        const userDoc = await User.findOne({ email: req.user.email });
        if(userDoc){
            return res.send({
                success: true,
                error: '',
                data: userDoc
            })
        }
    }
}


exports.refreshUser = async (req, res, next) => {
    if (req.user) {
        const userDoc = await User.findOne({ email: req.user.email });
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
            await userDoc.save()
            return res.send({
                success: true,
                error: '',
                data: userDoc
            })
        }
    }
}