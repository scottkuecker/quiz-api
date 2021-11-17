const User = require('../db_models/user');
const bcrypt = require('bcryptjs');

exports.postSignUp = (req, res, next) =>{
    const email = 'test@test.com'
    const password = 'Masterdamus12';
    const repeatPassword = 'Masterdamus12';
    if(password !== repeatPassword){
        return res.send({
            success: false,
            data: null,
            error: 'Password and repeat password did not match'
        })
    }
   
    User.findOne({email: email})
    .then(userDoc =>{
        if(userDoc){
            console.log('user exists')
            return console.log(userDoc)
        }
        
        return bcrypt.hash(password, 12)
    })
    .then(hashedPassword =>{{
        const user = new User({
            email: email,
            password: hashedPassword,
            roles: ['USER'],
            contributions: [],
            questions: []

        });
        
        return user.save();
    }})
    .then(res=>{
        console.log('user saved')
    })
    .catch(error=>{
        console.log('error creating user')
    })
}

exports.postLogin = (req, res, next) => {
        // req.session.isLogged = true;
    // req.session.save();
    // res.send({
    //     success: true
    // })
}