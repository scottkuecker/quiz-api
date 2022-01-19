const path = require('path');
const express = require('express');
const http = require("http");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const server = express();
server.use(cors());
const achs = require('./controllers/achievements')
const port = process.env.PORT;


// const middleware = require('./midleware/auth');

const questionRoutes = require('./routes/questions-routes');
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const achievementRoutes = require('./routes/achievement-routes');
const socketRoutes = require('./routes/socket-routes');

server.use(cors());
server.options('*', cors());
server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));

server.use(questionRoutes);
server.use(authRoutes);
server.use(userRoutes);
server.use(achievementRoutes);
server.use(socketRoutes);

server.use('', (req,res, next)=>{
        res.send({
            error: '404 Page not found'
        })
});

mongoose.connect(process.env.MONGO).then(() =>{
    const app = server.listen(port);
    const io = require('./socket').init(app);
    io.on('connection', socket =>{
        // console.log(socket.conn.id);
    })

    io.on('test', () =>{
        console.log('test')
    })
    // achs.createAchievements()
}).catch((error)=>{
    console.error(error)
})





