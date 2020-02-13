const express=require('express');
const router=require("./router")

// 创建 express 应用
const app= new express()    

app.use(router)

const serve=app.listen(5000,function(){
    const {address,port}=serve.address()
    console.log('Http Serve is running on http://%s:%s', address, port);
});