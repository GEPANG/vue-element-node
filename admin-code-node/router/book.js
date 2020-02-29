const express=require('express');
const router = express.Router()
const boom=require('boom')
//文件上传模块
const multer=require("multer")
const Result=require("../models/Result")
const Book=require("../models/Book")
//电子书存储路径
const {UPLOAD_PATH}=require("../utils/constant")
const {decoded}=require('../utils/index.js') 

const bookService=require('../services/book')

router.post(
    '/upload',
    multer({dest:`${UPLOAD_PATH}/book`}).single('file'),
    function(req,res,next){
        if(!req.file || req.file.length===0){
            new Result('上传电子书失败').fail(res)
        }else{      
            const book =new Book(req.file);   
            // console.log(book)   
            book.parse().then(book=>{
                // console.log('book:',book)
                new Result(book,'上传电子书成功').success(res)
            }).catch(err=>{
                // console.log('upload',err)
                next(boom.badImplementation(err))
            })
        }
        // new Result('上传电子书成功').success(res)        
})

router.post('/create',(req,res,next)=>{
    const decode= decoded(req)
    // console.log(decode)
    // console.log('body:',req.body)
    if(decode && decode.username){
        req.body.username=decode.username
    }
    const book = new Book(null,req.body)
    // const book={}
    bookService.insertBook(book).then(()=>{
        new Result('新增电子书成功').success(res)
    }).catch(err=>{
        next(boom.badImplementation(err))
    })
    // console.log(book)
})

router.post('/update',(req,res,next)=>{
    const decode= decoded(req)
    if(decode && decode.username){
        req.body.username=decode.username
    }
    const book = new Book(null,req.body)
    bookService.updateBook(book).then(()=>{
        new Result('更新电子书成功').success(res)
    }).catch(err=>{
        next(boom.badImplementation(err))
    })
})

router.get('/get',(req,res,next)=>{
    const {fileName}=req.query
    if(!fileName){
        next(boom.badImplementation(new Error('参数fileName不能为空')))
    }else{
        bookService.getBook(fileName).then((book)=>{
            new Result(book,'获取图书信息成功').success(res)
        }).catch(err=>{
            next(boom.badImplementation(err))
        })
    }
})

router.get('/category',(req,res,next)=>{
   bookService.getCategory().then(category=>{
       new Result(category,"获取分类成功").success(res)
   }).catch(err=>{
       next(boom.badImplementation(err))
   })
})

router.get('/list',(req,res,next)=>{
    bookService.listBook(req.query).then(({list,count,page,pageSize})=>{
        new Result({list,count,page:+page,pageSize:+pageSize},"获取图书列表成功").success(res)
    }).catch(err=>{
        next(boom.badImplementation(err))
    })
})

module.exports=router