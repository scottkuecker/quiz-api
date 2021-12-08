const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const middleware = require('./midleware/auth');
const utils = require('./utils/daily-reset');
const { google } = require('googleapis');

const KEYFILEPATH = path.join(__dirname, 'environment.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES
})

const REFRESH_TOKEN = '';

const authorizeUrl = 'https://www.googleapis.com/auth/drive';

const questionRoutes = require('./routes/questions-routes');
const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const achievementRoutes = require('./routes/achievement-routes');
const multer = require('multer');

const server = express();

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public')
    },
    filename: async function (req, file, cb) {
    
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        const fileData = {
            name: uniqueSuffix,
            mimeType: file.mimetype
        }
        cb(null, uniqueSuffix)
        await uploadImage(fileData);
    }
})
const upload = multer({storage});


server.use(express.urlencoded({extended: false}))
server.use(express.json())
server.use(express.static(path.join(__dirname, 'public')));
server.use(cors({ origin: ['http://localhost:4200', 'https://kviz-live.web.app', 'http://localhost:4201'] }));
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
    utils.initiDailiReset();
    server.listen(port)
}).catch((error)=>{
    console.error(error)
})
const driveService = google.drive({ version: 'v3', auth });

async function uploadImage(fileData){
    setTimeout(async ()=>{
        let fileMetaData = {
            'name': fileData.name
        }
        let media = {
            mimeType: fileData.mimeType,
            body: fs.createReadStream(`public/${fileData.name}`)
        }

        console.log(media)

        let response = await driveService.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'webViewLink'
        })
        console.log(response)
    }, 1000)

}






