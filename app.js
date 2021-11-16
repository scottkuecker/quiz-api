const path = require('path');
const express = require('express');
const mongoConnect = require('./utils/db');
const mongoose = require('mongoose');
const databaseUrl = require('./environment');

const questionRoutes = require('./routes/questions-routes');

const server = express();

const port = 3000;

server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')))
server.use(questionRoutes);

server.use('', (req,res,next)=>{
        res.send({
            error: 'Page not found'
        })
})
mongoose.connect(databaseUrl.mongoUrl).then(res =>{
    console.log('connected')
    server.listen(3000)
}).catch(err=>{
    console.log(err)
})






