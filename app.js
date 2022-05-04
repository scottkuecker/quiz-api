const path = require('path');
const express = require('express');
const USER = require('./controllers/socket-functions/auth');
const http = require("http");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const server = express();
server.use(cors())
const ioEvents = require('./controllers/socket-io');
const port = process.env.PORT;


server.set('views', './views');
server.set('view engine', 'ejs');
server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));

server.get('/activate/:token', USER.activateUser);

server.use('', (req,res, next)=>{
        res.send({
            message: '404 Page not found'
        })
});

mongoose.connect(process.env.MONGO).then(() =>{
    const app = server.listen(port);
    const io = require('./socket').init(app);
    ioEvents.setupListeners();
    console.log('connected')
}).catch((error)=>{
    console.error('error connecting')
    console.log(error)
})





