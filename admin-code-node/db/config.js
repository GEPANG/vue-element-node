const env = process.env.NODE_ENV;

console.log(env)
let MYSQL_CONF={
    host:"101.200.182.97",
    user:"root",
    port:"3306",
    password:"Abc123456.",
    database:"book"
}
/* if(env === 'dev'){
    MYSQL_CONF={
        host:"localhost",
        user:"root",
        port:"3308",
        password:"123456",
        database:"book"
    }
}
if(env==='prd'){
    MYSQL_CONF={
        host:"101.200.182.97",
        user:"root",
        port:"3306",
        password:"Abc123456.",
        database:"book"
    }
}
 */

module.exports={
    MYSQL_CONF
}