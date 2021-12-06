const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const middleware = require('./midleware/auth');



const questionRoutes = require('./routes/questions-routes');
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const achievementRoutes = require('./routes/achievement-routes');
const multer = require('multer');

const server = express();

const port = process.env.port || 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix)
    }
})
const upload = multer({storage})


server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));
server.use(cors({ origin: ['http:localhost:4200', 'https://kviz-live.web.app'] }));
server.post('/add-image-question', upload.single('image'), (req, res, next) => {
    const auth = req.get('Authorization');
    if (!auth) {
        return res.send({
            success: false,
            error: 'Not logged in'
        })
    }
    const token = auth.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.signingSecret);
        if(!decodedToken){
           throw new Error('Please log in')
        }
    }
    catch (e) {
        return res.json({
            sucess: false,
            data: undefined,
            error: 'Authorization failed or missing tokken'
        })
    }
    if (req.file) {
        const path = req.file.path.split('/')[1];
        return res.send({
            success: true,
            data: process.env.serverAddress + path
        })
    }
    return res.send({
        success: true
    })
})
server.use(questionRoutes);
server.use(authRoutes);
server.use(userRoutes);
server.use(achievementRoutes);

server.use('', (req,res, next)=>{
        res.send({
            error: '404 Page not found'
        })
})

mongoose.connect(process.env.mongoUrl).then(() =>{
    console.log('connected')
    server.listen(port)
}).catch((error)=>{
    console.error(error)
})






