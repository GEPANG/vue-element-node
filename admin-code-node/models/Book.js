const {
    MIME_TYPE_EPUB,
    UPLOAD_URL,
    OLD_UPLOAD_URL,
    UPLOAD_PATH}=require('../utils/constant')
const fs=require('fs')
const Epub=require('../utils/epub');
const xml2js=require('xml2js').parseString
const path=require('path');
class Book{
    constructor(file,data){
        if(file){
            this.createBookFromFile(file);
        }else{
            this.createBookFromData(data);
        }
    }   

    createBookFromFile(file){
        // console.log('createBookFromFile',file)
        const {
            destination,
            filename,
            mimetype = MIME_TYPE_EPUB,
            path,
            originalname
        }=file
        //电子书文件后缀名
        const suffix=mimetype===MIME_TYPE_EPUB?'.epub':''
        //电子书文件原有路径
        // const oldBookPath=`${destination}/${filename}`
        const oldBookPath=path
        //电子书文件新路径
        const bookPath=`${destination}/${filename}${suffix}`
        //电子书的下载url链接
        const url=`${UPLOAD_URL}/book/${filename}${suffix}` 
        //电子书解压后的文件夹路径
        const uzipPath=`${UPLOAD_PATH}/unzip/${filename}`
        //电子书解压后的文件夹url
        const unzipUrl=`${UPLOAD_URL}/unzip/${filename}`
        if(!fs.existsSync(uzipPath)){
            fs.mkdirSync(uzipPath,{recursive:true})
        }
        if(fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)){
            fs.renameSync(oldBookPath,bookPath);
        }
        this.fileName=filename //文件名
        this.path=`/book/${filename}${suffix}`//epub文件相对路径
        this.filePath=this.path
        this.unzipPath=`/unzip/${filename}`//epub文件解压相对路径
        this.url=url    //epub文件下载链接
        this.title=''   //电子书的书名
        this.author=''  //作者
        this.publisher=''   //出版社
        this.contents=[]    //目录
        this.contentsTree=[] //数状目录结构
        this.cover=''   //封面图片的url
        this.coverPath=''//封面图片的路径
        this.category=-1    //分类id
        this.categoryText=''    //分类名称
        this.unzipUrl=unzipUrl  //解压后的文件夹链接
        this.originalName=originalname//电子书的原名
    }   

    createBookFromData(data){
        this.fileName = data.fileName
        this.cover = data.cover
        this.title = data.title
        this.author = data.author
        this.publisher = data.publisher
        this.bookId = data.fileName
        this.language = data.language
        this.rootFile = data.rootFile
        this.originalName = data.originalName
        this.path=data.path || data.filePath
        this.filePath=data.path || data.filePath
        this.unzipPath=data.unzipPath
        this.coverPath=data.coverPath
        this.createUser=data.username
        this.createDt=new Date().getTime()
        this.updateDt=new Date().getTime()
        this.updateType=data.updateType===0?data.updateType:1
        this.category=data.category || 99
        this.categoryText=data.categoryText || '自定义'
        this.contents=data.contents || []
    }

    parse(){
        return new Promise((resolve,reject)=>{
            const bookPath=`${UPLOAD_PATH}${this.filePath}`
            if(!fs.existsSync(bookPath)){
                reject(new Error('电子书不存在'))
            }
            const epub=new Epub(bookPath);
            epub.on('error',err=>{
                reject(err)
            })
            epub.on('end',err=>{
                if(err){
                    reject(err)
                }else{
                    // console.log(epub.metadata)
                    // console.log('epub',epub.manifest)
                    const {
                        language,
                        creator,
                        creatorFileAs,
                        title,
                        cover,
                        publisher
                    }=epub.metadata
                    if(!title){
                        reject(new Error('图书列表为空'))
                    }else{
                        this.title=title
                        this.language=language || ''
                        this.author=creator || creatorFileAs || 'unknow'
                        this.publisher=publisher || 'unknow' 
                        this.rootFile=epub.rootFile                        
                        const handleGetImage=(err,file,mimeType)=>{
                            // console.log(err,file,mimetype)
                            if(err){
                                reject(err)
                            }else{
                                const suffix=mimeType.split('/')[1] //后缀，jpg..
                                const coverPath=`${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                                const coverUrl=`${UPLOAD_URL}/img/${this.fileName}.${suffix}`
                                fs.writeFileSync(coverPath,file,'binary')
                                this.coverPath=`/img/${this.fileName}.${suffix}`
                                this.cover=coverUrl
                                resolve(this) 
                            }
                        } 
                        //目录解析
                        try{
                            this.unzip()
                            this.parseContents(epub).then(({chapters,chapterTree})=>{
                                this.contents=chapters
                                this.contentsTree=chapterTree
                                epub.getImage(cover,handleGetImage)   
                            })                           
                            // console.log('cover',cover)
                            // epub.getImage(cover,handleGetImage)   
                        }catch(e){
                            reject(e)
                        }
                        
                    }       
                }                                      
            })
            epub.parse()
        })        
    }
    unzip(){
        const Admzip=require('adm-zip')
        const zip = new Admzip(Book.genPath(this.path))
        //extractAllTo--这个将路径下的文件进行解压，放到新的路径下
        //第一个参数：新路径，第二参数，为true表示对已有的文件进行覆盖
        zip.extractAllTo(Book.genPath(this.unzipPath),true)
    }
    //电子书的绝对路径
    static genPath(path){
        if(!path.startsWith('/')){
            path=`/${path}`
        }
        return `${UPLOAD_PATH}${path}`
    }
    parseContents(epub){      
        function getNcxFilePath(){
            const spine=epub && epub.spine
            // console.log(spine)
            const  manifest=epub && epub.manifest
            const ncx=spine.toc && spine.toc.href
            const id=spine.toc && spine.toc.id
            // console.log('spine',spine.toc,ncx,id,manifest[id].href)
            if(ncx){
                return ncx
            }else{
                return manifest[id].href
            }
        }
        function findParent(array,level=0,pid=''){//标准目录解析
            return array.map(item=>{
                item.level=level
                item.pid=pid
                if(item.navPoint && item.navPoint.length>0){
                    item.navPoint=findParent((item.navPoint,level+1,item['$'].id))
                }else if(item.navPoint){
                    item.navPoint.level=level+1
                    item.navPoint.pid=item['$'].id
                }
                return  item
            })
        }
        function flatten(array){//
            return [].concat(...array.map(item=>{
                if(item.navPoint && item.navPoint.length>0){
                    return [].concat(item,...flatten(ite.navPoint))
                }else if(item.navPoint){
                    return [].concat(item,item.navPoint)
                }
                return item
            }))
        }
        const NcxFilePath=Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
        // console.log(NcxFilePath)
        if(fs.existsSync(NcxFilePath)){
            return new Promise((resolve,reject)=>{
                const xml=fs.readFileSync(NcxFilePath,'utf-8');   
                const dir=path.dirname(NcxFilePath).replace(UPLOAD_PATH,'')
                // console.log('dir',dir)
                const fileName=this.fileName
                const unzipPath=this.unzipPath
                xml2js(xml,{
                    explicitArray:false,
                    ignoreAttrs:false
                },function(err,json){
                    if(err){
                        reject(err)
                    }else{
                        const navMap=json.ncx.navMap
                        // console.log('xml:',navMap)
                        // console.log('navMap-- ',JSON.stringify(navMap))
                        if(navMap.navPoint && navMap.navPoint.length>0){
                            navMap.navPoint=findParent(navMap.navPoint)
                            const newNavMap=flatten(navMap.navPoint)//改成一维数组
                            // console.log(newNavMap==navMap.navPoint)
                            // console.log('nav',newNavMap[0].content['$']);// src: 'ACoverHTML.html'
                            // console.log('nav',newNavMap.length,epub.flow.length)
                            const chapters=[]
                            // console.log(epub.flow)//epub.flow电子书的展示顺序
                            // epub.flow.forEach((chapter,index)=>{
                            newNavMap.forEach((chapter,index)=>{
                                /*if(index+1>newNavMap.length){
                                    return 
                                }
                                const nav=newNavMap[index] */
                                // console.log('chapter;',chapter)
                                const src=chapter.content['$'].src
                                chapter.id=`${src}`
                                chapter.href=`${dir}/${src}`.replace(unzipPath,'')
                                chapter.text=`${UPLOAD_URL}${dir}/${src}` //章节的url
                                // console.log(chapter.text)
                                chapter.label=chapter.navLabel.text || ''
                                chapter.navId=chapter["$"].id
                                chapter.fileName=fileName
                                chapter.order=index+1
                                // console.log('chapter;',chapter)
                                chapters.push(chapter)
                            })
                            const chapterTree=Book.genContentsTree(chapters)
                           /*  chapters.forEach(c=>{
                                c.children=[]
                                if(c.pid==''){
                                    chapterTree.push(c)
                                }else{
                                    const parent=chapters.find(_=>_.navId===c.pid)
                                    parent.children.push(c)
                                }
                            }) */
                            // console.log(chapterTree)
                            // console.log(chapters)
                            resolve({chapters,chapterTree})
                        }else{
                            reject(new Error('目录解析失败，目录数为0'));
                        }
                    }
                })
            })
        }else{
            throw new Error('目录对应的资源文件不存在');
        }
    }

    toDb(){
        return {
            fileName : this.fileName,
            cover : this.cover,
            title : this.title,
            author : this.author,
            publisher : this.publisher,
            bookId : this.fileName,
            language : this.language,
            rootFile : this.rootFile,
            originalName : this.originalName,
            filePath : this.filePath,
            unzipPath : this.unzipPath,
            coverPath : this.coverPath,
            createUser : this.createUser,
            createDt : this.createDt,
            updateDt : this.updateDt,
            updateType : this.updateType,
            category : this.category,
            categoryText : this.categoryText
        }
    }

    getContents(){
        return this.contents
    }

    reset(){
        // console.log('fileName',this.fileName)
        if(Book.pathExists(this.filePath)){
            // console.log('删除文件')
            fs.unlinkSync(Book.genPath(this.filePath))
        }
        if(Book.pathExists(this.coverPath)){
            // console.log('删除封面')
            fs.unlinkSync(Book.genPath(this.coverPath))
        }
        if(Book.pathExists(this.unzipPath)){
            // console.log('删除解压路径')
            //node低版本不支持rmdirSync
            fs.rmdirSync(Book.genPath(this.unzipPath),{recursive:true})
        }
    }
    static pathExists(path){
        if(path.startsWith(UPLOAD_PATH)){
            return fs.existsSync(path)
        }else{
            return fs.existsSync(Book.genPath(path))
        }
    }
    static genCoverUrl(book){
        const {cover}=book
        if(+book.updateType===1){            
            // console.log(cover)
            if(cover){
                /* if(cover.startsWith('/')){
                    return `${OLD_UPLOAD_URL}${cover}`
                }else{                    
                    return `${OLD_UPLOAD_URL}${cover}`
                } */
                return `${cover}`
            }else{
                return null
            }
        }else{
            if(cover){
                if(cover.startsWith('/')){
                    return `${UPLOAD_URL}${cover}`
                }else{                    
                    return `${UPLOAD_URL}${cover}`
                }
            }else{
                return null
            }
        }
    }
    static genContentsTree(contents){
        if(contents){
            const contentsTree=[]
            contents.forEach(c=>{
                c.children=[]
                if(c.pid===''){
                    contentsTree.push(c)
                }else{
                    const parent= contents.find(_=>_.navId===c.pid)
                    parent.children.push(c)
                }
            })
            return contentsTree
        }        
    }
}
module.exports=Book