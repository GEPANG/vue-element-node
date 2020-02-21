//引入mysql配置
const {querySql,queryOne}=require('../db')

//引入加密模块
const {md5}=require('../utils/index');

//引入写的密钥结合真实密码加密
const {PWD_SALT}=require('../utils/constant')

function login(username,password){
    password=md5(`${password}${PWD_SALT}`);
    return querySql(`select * from admin_user where username='${username}' and password='${password}'`)
}
function findUser(username){
    return queryOne(`select username,role,nickname,avatar from admin_user where username='${username}'`)
}
module.exports={
    login,
    findUser
}