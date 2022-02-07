const ErrorDB = require('../db_models/errors')

exports.handleError = (fn) =>{
    return (req,res,next) => {
        try{
            fn(req, res, next)
        }catch(error){
            const err = new ErrorDB({
                message: String(error),
                caused_by: fn.name
            })
            err.save();
        }
    }
}