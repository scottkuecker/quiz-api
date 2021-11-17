const User = require('../db_models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const environment = require('../environment');

exports.postSignUp = (req, res, next) =>{
    const email = req.body.email;
    const password = req.body.password;
    const repeatPassword = req.body.repeatPassword;
    if(password !== repeatPassword){
        return res.redirect('/login');
    }
   
    User.findOne({email: email})
    .then(userDoc =>{
        if(userDoc){
            console.log('user exists')
            return res.redirect('/login');
        }
        return bcrypt.hash(password, 12)
                     .then(hashedPassword => {
                        {
                            const user = new User({
                                email: email,
                                password: hashedPassword,
                                roles: ['USER'],
                                contributions: [],
                                questions: []

                            });
                            return user.save();
                        }
        })
    })
    .then(res=>{
        console.log('user saved')
    })
    .catch(error=>{
        console.log('error creating user')
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let user = null;
    User.findOne({ email: email })
        .then(userDoc => {
            if (!userDoc) {
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password).then(doMatch =>{
                if(doMatch){
                    const token = jwt.sign({
                        success: true,
                        user: userDoc,
                        error: []
                    }, environment.signingSecret,{expiresIn: '3h'})
                    return res.status(200).json({
                        user: userDoc,
                        token: token
                    })
                }
            }).catch(error=>console.log('password not match')) 
        })
        .catch(error=>{
            console.log('error in postLogin')
        })
}