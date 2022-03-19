const path = require('path');
const express = require('express');
const http = require("http");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const server = express();
server.use(cors({
 origin:["https://kviz-live.web.app", "http://localhost:4200"],
 allowedHeaders: ["Authorization", "Content-Type", "X-Requested-With", "authorization", "Credentials", "content-type"],
 credentials: true
}))
const ioEvents = require('./controllers/socket-io');
const port = process.env.PORT;

server.use('', (req,res,next) =>{
    console.log(req.get('host'))
    next()
})
const questionRoutes = require('./routes/questions-routes');
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const achievementRoutes = require('./routes/achievement-routes');
const socketRoutes = require('./routes/socket-routes');

server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));

server.use(questionRoutes);
server.use(authRoutes);
server.use(userRoutes);
server.use(achievementRoutes);

server.use('', (req,res, next)=>{
        res.send({
            error: '404 Page not found'
        })
});

mongoose.connect(process.env.MONGO).then(() =>{
    const app = server.listen(port);
    const io = require('./socket').init(app);
    ioEvents.setupListeners();
    console.log('connected')
}).catch((error)=>{
    console.error('error connecting')
})





