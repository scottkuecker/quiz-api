const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const url = 'mongodb+srv://milancakic:Masterdamus12@quiz-cluster.vopbe.mongodb.net/myFirstDatabase?retryWrites=true'

const mongoConnect = (callback) =>{
    MongoClient.connect(url).then(result => {
        console.log('connected')
        callback(result)
    }).catch(error =>{
        callback(null)
    });
}

module.exports = mongoConnect;