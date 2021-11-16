const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const environment = require('./environment');
const session = require('express-session');
const MongoDBStore= require('connect-mongodb-session')(session);

const questionRoutes = require('./routes/questions-routes');
const authRoutes = require('./routes/auth-routes');

const server = express();

const store = new MongoDBStore({
    uri: environment.mongoUrl,
    collection: 'sessions'
})

const port = 3000;

server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));
server.use(session({
    secret: environment.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store
}))
server.use(questionRoutes);
server.use(authRoutes);

server.use('', (req,res, next)=>{
        res.send({
            error: '404 Page not found'
        })
})

mongoose.connect(environment.mongoUrl).then(() =>{
    console.log('connected')
    server.listen(port)
}).catch(()=>{
    console.error('could not connect')
})






