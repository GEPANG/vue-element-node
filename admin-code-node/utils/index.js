//引入加密模块
const crypto=require('crypto')

const jwt=require('jsonwebtoken');

const {PRIVATE_KEY}=require('../utils/constant')


function md5(s){
    //update需要string类型否则会报错
     return crypto.createHash('md5').update(String(s)).digest('hex')
}

function decoded(req){
    let token=req.get('Authorization')
    // console.log(token)
    if(token.indexOf('Bearer') === 0){
        token=token.replace('Bearer ','');
    }
    return jwt.verify(token, PRIVATE_KEY)
}

module.exports={
    md5,
    decoded
}