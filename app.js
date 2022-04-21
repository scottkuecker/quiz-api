const path = require('path');
const express = require('express');
const http = require("http");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const server = express();
server.use(cors())
const ioEvents = require('./controllers/socket-io');
const port = process.env.PORT;

server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));


server.use('', (req,res, next)=>{
        res.send({
            error: '404 Page not found'
        })
});

mongoose.connect(process.env.MONGO).then(() =>{
    const app = server.listen(port);
    const io = require('./socket').init(app);
    ioEvents.setupListeners();
}).catch((error)=>{
    console.error('error connecting')
    console.log(error)
})





