<template>
    <el-form ref="postForm" :model="postForm" :rules='rules'>
         <sticky :class-name="'sub-navbar'">
            <el-button v-if="!isEdit" @click="showGuide">显示帮助</el-button>    
            <el-button v-loading='loading'   
                       type='success'
                       @click="submitForm"                      
            >
                {{isEdit ? '编辑电子书':'新增电子书'}}
            </el-button> 
        </sticky>        
        <div class="detail-container">
            <el-row>
                <wraning></wraning>                   
                <el-col :span='24'>
                    <!-- 上传控件的具体样式 -->
                    <EbookUpload
                        :file-list="fileList"
                        :disabled='isEdit'
                        @onSuccess="onUploadSuccess"
                        @onRemove="onUploadRemove"
                    />
                </el-col> 
                <el-col :span='24'>
                    <!-- 表单控件的基本样式 -->       
                    <el-form-item prop="title">
                        <MDinput v-model="postForm.title" 
                                 :maxlength='100' 
                                 name='name'
                                 required
                        >
                                书名
                        </MDinput>
                    </el-form-item>   
                    <el-row>
                        <el-col :span='12'>
                            <el-form-item prop="author" label='作者：' :label-width='labelWidth'>
                                <el-input v-model="postForm.author"
                                          placeholder='作者'                                          
                                >
                                </el-input>    
                            </el-form-item>
                        </el-col>    
                        <el-col :span='12'>
                            <el-form-item prop="publisher" label='出版社：' :label-width='labelWidth'>
                                <el-input v-model="postForm.publisher"
                                          placeholder='出版社'
                                >
                                </el-input>    
                            </el-form-item>
                        </el-col>                         
                    </el-row>   
                    <el-row>
                        <el-col :span='12'>
                            <el-form-item prop="language" label='语言' :label-width='labelWidth'>
                                <el-input v-model="postForm.language"
                                          placeholder='语言'
                                >
                                </el-input>    
                            </el-form-item>
                        </el-col>    
                        <el-col :span='12'>
                            <el-form-item prop="rootFile" label='根文件：' :label-width='labelWidth'>
                                <el-input v-model="postForm.rootFile"
                                          placeholder='根文件'
                                          disabled
                                >
                                </el-input>    
                            </el-form-item>
                        </el-col>                         
                    </el-row>   
                    <el-row>
                        <el-col :span='12'>
                            <el-form-item prop="filePath" label='文件路劲：' :label-width='labelWidth'>
                                <el-input v-model="postForm.filePath"
                                          placeholder='文件路劲'
                                          disabled
                                >
                                </el-input>    
                            </el-form-item>
                        </el-col>    
                        <el-col :span='12'>
                            <el-form-item prop="unzipPath" label='解压路劲：' :label-width='labelWidth'>
                                <el-input v-model="postForm.unzipPath"
                                          placeholder='解压路劲'
                                          disabled
                                >
                                </el-input>    
                            </el-form-item>
                        </el-col>                         
                    </el-row> 
                    <el-row>
                        <el-col :span='12'>
                            <el-form-item prop="coverPath" label='封面路劲：' :label-width='labelWidth'>
                                <el-input v-model="postForm.coverPath"
                                          placeholder='封面路劲'
                                          disabled
                                >
                                </el-input>    
                            </el-form-item>
                        </el-col>    
                        <el-col :span='12'>
                            <el-form-item prop="originalName" label='文件名称：' :label-width='labelWidth'>
                                <el-input v-model="postForm.originalName"
                                          placeholder='文件名称'
                                          disabled
                                >
                                </el-input>    
                            </el-form-item>
                        </el-col>                         
                    </el-row>  
                    <el-row>
                        <el-col :span='24'>
                            <el-form-item prop="cover" label='封面：' :label-width="labelWidth">
                                <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
                                    <img :src="postForm.cover" class="preview-img">
                                </a>
                                <span v-else>无</span>
                            </el-form-item>
                        </el-col>                                                   
                    </el-row>  
                    <el-row>
                         <el-col :span="24">
                            <el-form-item label="目录：" :label-width="labelWidth">
                                <div v-if="contentsTree && contentsTree.length > 0" 
                                    class="contents-wrapper">
                                    <el-tree :data="contentsTree" @node-click="onContentClick" />
                                </div>
                                <span v-else>无</span>
                            </el-form-item>
                        </el-col>                                                
                    </el-row>  
                </el-col>
            </el-row>    
        </div>   
    </el-form>
</template>

<script>
import Sticky from '../../../components/Sticky/index'
import EbookUpload from '../../../components/EbookUpload/index'
import MDinput from '../../../components/MDinput/index'
import Wraning from './wraning'
import {createBook,getBook,updateBook} from '../../../api/book'

/* const defaultForm={
    title:'',
    author:'',
    publisher:'',
    language:'',
    rootFile:'',
    cover:'',
    originalName:'',
    fileName:'',
    coverPath:'',
    filePath:'',
    unzipPath:''
} */
const fields={
        title:"书名",
        author:'作者',
        publisher:"出版社",
        language:"语言"
    }
export default {
     props:{
         isEdit:Boolean
     },
     components:{
         Sticky,
         Wraning,
         EbookUpload,
         MDinput
    },
     data(){
         const validateRequire=(rule,value,callback)=>{
            //  console.log(rule,value)
             if(value.length===0){
                 callback(new Error(fields[rule.field]+　'必须填写'))
             }else{
                 callback()
             }
         }        
         return {
             loading:false,
             postForm: {status: 'draft'},
             fileList: [],
             labelWidth:'120px',             
             contentsTree:[],
             rules:{
                 title:[{validator:validateRequire}],
                 author:[{validator:validateRequire}],
                 publisher:[{validator:validateRequire}],
                 language:[{validator:validateRequire}], 
             },           
         }
     },
     methods:{
         setDefault(){
            //  this.postForm=Object.assign({},defaultForm 
             this.contentsTree=[]      
             this.fileList = []
             this.$refs.postForm.resetFields()
            //  console.log('123',this.fileList)
         },
         onContentClick(data){
            // console.log(data)
            if(data.text){
                window.open(data.text)
            }
         },
         setData(data){
             const {
                title,
                author,
                publisher,
                language,
                rootFile,
                cover,
                url,
                originalName,
                contents,
                contentsTree,
                fileName,
                coverPath,
                filePath,
                unzipPath
             }=data
             this.postForm={
                 ...this.postForm,
                title,
                author,
                publisher,
                language,
                rootFile,
                cover,
                url,
                originalName,
                contents,
                contentsTree,
                fileName,
                coverPath,
                filePath,
                unzipPath
             }         
            //  console.log(cover)   
            //  console.log('contentsTree',contentsTree)
             this.contentsTree=contentsTree
             this.fileList=[{name:originalName || fileName,url}]
         },
         submitForm(){
            if(!this.loading){
            this.loading=true                      
            this.$refs.postForm.validate((valid,fields) => {
                    // console.log(valid,fields)
                    if(valid){
                        //浅拷贝
                        const book=Object.assign({},this.postForm)//浅拷贝 
                        // delete book.contents
                        delete book.contentsTree
                        if(!this.isEdit){
                            createBook(book).then((res)=>{
                                const {msg}=res
                                // console.log(res)
                                this.$notify({
                                    title:"操作成功",
                                    message:msg,
                                    type:'success',
                                    duration:2000
                                })
                                this.loading=false     
                                this.setDefault()                      
                            }).catch(()=>{
                                this.loading=false
                            })
                        }else{
                            updateBook(book).then(res=>{
                                // console.log(res)
                                const {msg}=res
                                // console.log(res)
                                this.$notify({
                                    title:"操作成功",
                                    message:msg,
                                    type:'success',
                                    duration:2000
                                })
                                this.loading=false     
                            }).cath(()=>{
                                this.loading=false
                            })
                        }
                        // console.log(book)
                    }else{
                        // console.log(fields[Object.keys(fields)[0]][0].message)
                        const message=fields[Object.keys(fields)[0]][0].message
                        this.$message({
                            message:message,
                            type:'error'
                        })
                        this.loading=false
                    }
                })
            }
         },
         showGuide () {
            console.log('showGuide,,,');           
         },         
         onUploadSuccess(data){
            //  console.log('onUploadSuccess',data);
             this.setData(data)
         },
         onUploadRemove(){             
             this.setDefault();
            //  console.log('onUploadRemove');
         },
         getBookData(fileName){
             getBook(fileName).then((res)=>{
                 this.setData(res.data)
             })
         }
     },
     created(){
        //console.log(this.$route.params)
        if(this.isEdit){
            const fileName=this.$route.params.fileName
            this.getBookData(fileName)
        }
     }   
}
</script>
<style lang="scss" scoped>
.detail-container{
    padding: 40px 50px 20px;
    .preview-img{
        width: 200px;
        width: 270px;
    }
}
</style>

