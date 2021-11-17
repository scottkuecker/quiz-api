const User = require('../db_models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const environment = require('../environment');

exports.signUp = async (req, res, next) =>{
    const email = 'test2@test.com';
    const password = 'Testerdamus12';
    const repeatPassword = 'Testerdamus12';
    if(password !== repeatPassword){
        return res.redirect('/login');
    }
    const user = await User.findOne({email: email});
    if(user){
            return res.redirect('/login');
    }
    let hashedPassword = await bcrypt.hash(password, 12);
    if(hashedPassword){
        const user = new User({
            email: email,
            password: hashedPassword,
            roles: ['USER'],
            contributions: [],
            questions: []

        });
        return user.save();
    }
}

exports.login = async (req, res, next) => {
    // const email = req.body.email;
    // const password = req.body.password;
    const email = 'test2@test.com';
    const password = 'Testerdamus12';
    const userDoc = await User.findOne({ email: email });
    if (!userDoc){
        throw new Error('User does not exist')
    }
    else{
        const doMatch = await bcrypt.compare(password, userDoc.password);
        if (doMatch) {
            const token = jwt.sign({ user: userDoc }, environment.signingSecret, { expiresIn: '3h' })
            return res.status(200).json({
                user: {
                    email: userDoc.email,
                    name: userDoc.name,
                    title: userDoc.title,
                    score: userDoc.score,
                    lives: userDoc.lives,
                    roles: userDoc.roles,
                    contributions: userDoc.contributions,
                    avatar_url: userDoc.avatar_url,
                    questions: userDoc.questions
                },
                token: token
            })
        } else {
            throw new Error('Password did not match')
        }
    } 
}