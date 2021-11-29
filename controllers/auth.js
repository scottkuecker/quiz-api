const User = require('../db_models/user');
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
    if (!userDoc){
        return res.json({
            success: false,
            data: undefined,
            error: 'No user found'
        })
    }
    else{
        bcrypt.compare(password, userDoc.password).then(doMatch =>{
            if (doMatch) {
                const token = jwt.sign({ user: userDoc }, environment.signingSecret, { expiresIn: '3h' })
                return res.status(200).json({
                    data: {
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
}

exports.autoLogin = async (req, res, next) => {
    if(req.user){
        const userDoc = await User.findOne({ email: req.user.email });
        if(userDoc){
            res.send({
                success: true,
                error: '',
                data: userDoc
            })
        }
    }
}