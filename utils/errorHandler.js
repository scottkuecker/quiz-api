const ErrorDB = require('../db_models/errors')

exports.handleError = (fn) =>{
    return (req,res,next) => {
        try{
            fn(req, res, next)
            .then(result => console.log('finished'))
        }catch(error){
            const err = new ErrorDB({
                message: String(error),
                caused_by: fn.name
            })
            err.save();
        }
    }
}

exports.handleSocketError = (fn, socket, data) => {
    fn(socket, data)
    .catch(error => console.log(error))
}

exports.handleIOError = (fn, io, socket, data) => {
    fn(io, socket, data)
    .catch(error => console.log(error))
}