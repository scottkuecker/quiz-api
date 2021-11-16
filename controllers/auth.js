const User = require('../db_models/user');

exports.postSignUp = (req, res, next) =>{
    const email = req.body.email;
    const password = req.body.password;
    const repeatPassword = req.body.confirmPassword;
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
           return res.redirect('/signup')
        }
        const user = new User({
            email: email,
            password: password
        });
        return user.save();
    })
    .then(done=>{
        req.redirect('/login')
    })
    .catch(error=>{

    })
}

exports.postLogin = (req, res, next) => {
        // req.session.isLogged = true;
    // req.session.save();
    // res.send({
    //     success: true
    // })
}