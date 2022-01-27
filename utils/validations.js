
const categories = [
    'GEOGRAFIJA',
    'ISTORIJA',
    'MUZIKA',
    'FILMOVI I SERIJE',
    'POZNATE LICNOSTI',
    'SPORT',
    'RAZNO'
]

exports.isValidStringInput = (str) => {
    let type = typeof str;
    if(type !== 'string'){
        return false;
    }
    if(str.length < 5){
        return false;
    }
}


exports.isValidCategory = (req, res, next) => {
    if (!categories.contain(req.body.category)){
        res.send({
            success: false,
            data: undefined,
            message: 'Kategorija nije pronadjena'
        })
    }
    next()
}



