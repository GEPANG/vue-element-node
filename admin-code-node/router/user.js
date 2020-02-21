const express = require('express')
const router = express.Router()

//引入result.js模块
const Result=require('../models/Result');

//数据库对数据的处理
const {login,findUser}=require('../services/user')

//body验证，validationResult使用
const {body,validationResult}=require('express-validator');

//引入boom
const boom=require('boom')

//引入jwt模块来生成token
const jwt=require('jsonwebtoken');

//引入写好的密钥和过期时间
const {PRIVATE_KEY,JWT_EXPIRED}=require('../utils/constant')

const {decoded}=require('../utils/index');

router.post('/login',
    [
      body('username').isString().withMessage('用户名必须为字符'),
      body('password').isString().withMessage('用户名必须为字符')
    ],
    function(req,res,next){    
    //console.log(req.body);
    //res.json({code:0, msg:'登录成功'})  
    const err=validationResult(req)
    // console.log(err) 
     if(!err.isEmpty()){
        // const msg=err.errors[0].msg
        const [{msg}]=err.errors //参数解构，和上一行一样的效果
        next(boom.badRequest(msg))//404错误，参数异常，传入信息
     }else{
        const {username,password}=req.body;
        login(username,password).then(user=>{//登录检测
            if(!user || user.length===0){
                new Result('登录失败').fail(res);
            }else{
                // const [_user]=user//得到用户
                const token=jwt.sign(//通过jwt的sign方法生成token
                    {username},
                    PRIVATE_KEY,
                    {expiresIn:JWT_EXPIRED }
                )
                new Result({token},'登录成功').success(res);
            }
        })
     }  

    /*if(username==='admin' && password==='111111'){
        new Result("登录成功").success(res)
    }else{
        new Result("登录失败").fail(res)
    }*/
})

router.get('/info', function(req, res) {
//   res.json('user info...')
    const decode=decoded(req);
    // console.log(decode)
    if(decode && decode.username){
        findUser(decode.username).then(user=>{
            // console.log(user)
            if(user){            
                user.roles = [user.role]
                // console.log( user.roles)
                new Result(user,'用户信息查询成功').success(res)
            }else{
                new Result('用户信息查询失败').fail(res)
            }
        })
    }else{
        new Result('用户信息查询失败').fail(res)
    }   
})

module.exports = router