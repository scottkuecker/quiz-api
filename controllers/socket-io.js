const io = require('../socket');

exports.somesocketRoute = (req, res,next) =>{
    io.getIO().emit('test', {test: "this is just test"})
    return res.send({
        success: true,
        data: null,
        error: undefined,
        message: undefined
    })
}