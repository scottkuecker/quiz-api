const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const middleware = require('./midleware/auth');
const utils = require('./utils/daily-reset');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');

const KEYFILEPATH = path.join(__dirname, 'environment.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const stream = fs.createReadStream(file);
        uploadImage(file, stream)
    }

    // filename: function (req, file, cb) {
    //     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    // }
});

const questionRoutes = require('./routes/questions-routes');
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const achievementRoutes = require('./routes/achievement-routes');

const server = express();

const port = process.env.PORT || 3000;

const driveService = google.drive({ version: 'v3', auth });

server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));
let upload = multer({ storage: storage}).single('image');
server.use(cors({ origin: ['http://localhost:4200', 'https://kviz-live.web.app', 'http://localhost:4201'] }));
server.post('/add-image-question', (req, res, next) => {
    upload(req)
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
    utils.initiDailiReset();
    console.log('connected')
    server.listen(port)
}).catch((error)=>{
    console.error(error)
})


async function uploadImage(file, stream){
    console.log(stream)
    let fileMetaData = {
        'name': Date.now() + file.originalname
    }
    // let media = {
    //     mimeType: file.mimetype,
    //     body: fs.createReadStream(file)
    // }

    // let response = await driveService.files.create({
    //     resource: fileMetaData,
    //     media: media,
    //     fields: 'id'
    // })

    console.log(response)
}






