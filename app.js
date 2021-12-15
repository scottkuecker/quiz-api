const path = require('path');
const express = require('express');
const http = require("http");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const middleware = require('./midleware/auth');
const utils = require('./utils/daily-reset');

const questionRoutes = require('./routes/questions-routes');
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const achievementRoutes = require('./routes/achievement-routes');

const server = express();

const port = 3000;



server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));
server.use(cors({ origin: ['http://localhost:4200', 'https://kviz-live.web.app', 'http://localhost:4201'] }));

server.use(questionRoutes);
server.use(authRoutes);
server.use(userRoutes);
server.use(achievementRoutes);

server.use('', (req,res, next)=>{
        res.send({
            error: '404 Page not found'
        })
})

setInterval( () => {
    //prevent heroku sleep
    http.get("https://kviz-znanja.herokuapp.com");
}, 10 * 60 * 1000);

mongoose.connect(process.env.mongoUrl).then(() =>{
    // utils.initiDailiReset();
    server.listen(port)
}).catch((error)=>{
    console.error(error)
})




