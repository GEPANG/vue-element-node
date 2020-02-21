const express=require('express');
const router=require("./router")
const fs=require('fs');
const https=require('https')

//解决跨域问题，使用cors
const cors=require('cors')

//引入body-parser来解析body内容
const bodyParser=require('body-parser');

// 创建 express 应用
const app= new express()    

//使用cors解决跨域问题
app.use(cors())

//读取密钥和证书
const privateKey=fs.readFileSync('./https/3470379_initdream.cn.key')
const pem =fs.readFileSync('./https/3470379_initdream.cn.pem')
const credentials={key:privateKey,cert:pem}
const httpsServer=https.createServer(credentials,app)//创建服务
httpsServer.listen(18082,function(){
    console.log('HTTPS Server is running on: https://localhost:%s', 18082)
})

//路由之前使用bodyParser
app.use(bodyParser.urlencoded({extended:true}))//解析参数
app.use(bodyParser.json());//json形式

app.use("/",router)

const serve=app.listen(5000,function(){
    const {address,port}=serve.address()
    console.log('Http Serve is running on http://%s:%s', address, port);
});