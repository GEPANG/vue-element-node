const expressJwt =require('express-jwt');
const {PRIVATE_KEY }=require('../utils/constant')
const jwtAuth=expressJwt({
    secret:PRIVATE_KEY ,
    credentialsRequired:true  //设置为false就不进行验证，游客也可登录
}).unless({
    path:['/','/user/login']
})

module.exports=jwtAuth