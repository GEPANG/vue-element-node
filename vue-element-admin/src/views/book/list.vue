<template>
    <div class="app-container">
        <div class="filter-container">
            <el-input
                v-model="listQuery.title"
                placeholder="书名"
                style="width:200px"
                class="filter-item"
                clearable
                @keyup.enter.native="handleFilter"
                @clear="handleFilter"
                @blur="handleFilter"
            />
            <el-input
                v-model="listQuery.author"
                placeholder="作者"
                style="width:200px"
                class="filter-item"
                clearable
                @keyup.enter.native="handleFilter"
                @clear="handleFilter"
                @blur="handleFilter"
            />
            <el-select
                v-model="listQuery.category"
                placeholder="分类"
                clearable
                class="filter-item"
                @change="handleFilter"               
            >
                <el-option 
                    v-for="item of categoryList" 
                    :key="item.value"
                    :label="item.label+'('+item.num+')'"
                    :value="item.value"
                />
            </el-select>
            <el-button
                v-waves
                class="filter-item"
                type="primary"
                icon="el-icon-search"
                style="margin-left:10px"
                @click="handleFilter"
            >
                查询
            </el-button>
             <el-button
                class="filter-item"
                type="primary"
                icon="el-icon-edit"
                style="margin-left:5px"
                @click="handleCreate"
            >
                新增
            </el-button>
            <el-checkbox
                v-model="showCover"
                class="filter-item"
                style="margin-left:5px"
                @click="changeShowCover"
            >
                显示封面
            </el-checkbox>
        </div>
        <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="list"
            border
            fit
            highlight-current-row
            style="width:100%"
            @sort-change="sortChange"
        >
            <el-table-column
                label="ID"
                prop="id"
                sortable="custom"
                align="center"
                width="80"
            >
            </el-table-column>
             <el-table-column
                label="书名"
                align="center"
                width="150"
            >   
                <template slot-scope="{row:{titleWrapper}}">
                    <!-- <span>{{titleWrapper}}</span> -->
                    <span v-html="titleWrapper"></span>
                </template>
            </el-table-column>
            <el-table-column
                label="作者"
                align="center"
                width="150"
            >   
                <template slot-scope="{row:{authorWrapper}}">
                    <!-- <span>{{authorWrapper}}</span> -->
                    <span  v-html="authorWrapper"></span>
                </template>
            </el-table-column>
             <el-table-column
                label="出版社"
                align="center"
                width="150"
                prop="publisher"
            >   
            </el-table-column>
             <el-table-column
                label="分类"
                align="center"
                width="150"
                prop="categoryText"
            >   
            </el-table-column>
             <el-table-column
                label="语言"
                align="center"
                prop="language"
            >   
            </el-table-column>
             <el-table-column
                label="封面"
                align="center"
                prop="cover"
                width="150"
                v-if="showCover"
            >   
                <template slot-scope="{row :{ cover }}">
                    <a :href="cover" target="_blank">
                        <img :src="cover" style="width:120px;height:180px">
                    </a>
                </template>
            </el-table-column>
             <el-table-column
                label="文件名"
                align="center"
                width="100"
                prop="fileName"
            >   
            </el-table-column>
             <el-table-column
                label="文件路劲"
                width="100"
                align="center"
                prop="filePath"
            >   
                <template slot-scope="{row:{filePath}}">
                    <span>{{filePath | valueFilter}}</span>
                </template>
            </el-table-column>
              <el-table-column
                label="封面路劲"
                width="100"
                align="center"
                prop="coverPath"
            >   
                 <template slot-scope="{row:{coverPath}}">
                    <span>{{coverPath | valueFilter}}</span>
                </template>
            </el-table-column>
              <el-table-column
                label="解压路劲"
                width="100"
                align="center"
                prop="unzipPath"
            >   
                 <template slot-scope="{row:{unzipPath}}">
                    <span>{{unzipPath | valueFilter}}</span>
                </template>
            </el-table-column>
              <el-table-column
                label="上传人"
                width="100"
                align="center"
                prop="createUser"
            >   
                 <template slot-scope="{row:{createUser}}">
                    <span>{{createUser | valueFilter}}</span>
                </template>
            </el-table-column>
              <el-table-column
                label="上传时间"
                width="100"
                align="center"
                prop="createDt"
            >   
                 <template slot-scope="{row:{createDt}}">
                    <span>{{createDt | timeFilter}}</span>
                </template>
            </el-table-column>
              <el-table-column
                label="操作"
                width="120"
                align="center"
                fixed="right"
            >   
                <template slot-scope="{row}">
                    <el-button type="text" icon="el-icon-edit" @click="handleUpdate(row)"></el-button>
                </template>                
            </el-table-column>
        </el-table>
        <pagination 
            v-show="total>0"
            :total="total"  
            :page.sync="listQuery.page"
            :limit.sync="listQuery.pageSize"
            @pagination="getList"
        />
    </div>
</template>
<script>
import Pagination from '../../components/Pagination/index'
import waves from '../../directive/waves/waves'
import {getCategory,listBook} from '../../api/book'
import {parseTime} from '../../utils'

export default {
    components:{
        Pagination
    },
    directives:{waves},
    filters:{
        valueFilter(value){
            return value ? value : '无'
        },
        timeFilter(time){
            return time ? parseTime(time,"{y}-{m}-{d} {h}:{i}") : '无'
        }
    },
    data(){
        return {
            listQuery:{
                page:1,
                pageSize:20,
                sort:"+id",
            },
            showCover:false,
            categoryList:[],
            tableKey:0,
            listLoading:true,
            list:[],
            total:0
        }
    },
    methods:{
        parseQuery(){
            const listQuery={
                page:1,
                pageSize:20
            }
            this.listQuery={...listQuery,...this.listQuery}
        },  
        handleFilter(){
            // console.log('handleFilter',this.listQuery)
            this.getList()
        },
        handleCreate(){
            this.$router.push('/book/create')
        },
        changeShowCover(value){
            // console.log(this.showCover)
            this.showCover=value
        },
        getCategoryList(){
            getCategory().then(res=>{
                this.categoryList=res.data
            })
        },
        sortChange(data){
            console.log('sortChange',data)
            const {prop,order}=data    
            this.sortBy(prop,order)       
        },
        sortBy(prop,order){
            if(order === 'ascending'){
                this.listQuery.sort=`+${prop}`
            }else{  
                this.listQuery.sort=`-${prop}`
            }
            this.handleFilter()
        },
        getList(){
            this.listLoading=true
            listBook(this.listQuery).then((res)=>{
                // console.log(res)
                const {list,count}=res.data
                this.list=list          
                this.total=count   
                console.log(list)
                this.listLoading=false
                this.list.forEach(book=>{
                    book.titleWrapper=this.wrapperkeyword('title',book.title)
                    book.authorWrapper=this.wrapperkeyword('author',book.author)
                })
            })
        },
        wrapperkeyword(k,v){
            function highlight(value){
                return `<span style="color:#1890ff">${value}</span>`                
            }
            if(!this.listQuery[k]){
                return v
            }else{
                return v.replace(new RegExp(this.listQuery[k],'ig'),v=>highlight(v))
            }
        },
        handleUpdate(row){
            // console.log(row)
            this.$router.push(`/book/edit/${row.fileName}`)
        }
    },
    created(){
        this.parseQuery()
    },
    mounted(){
        this.getList()
        this.getCategoryList()
    }
}
</script>
<style scoped>

</style>