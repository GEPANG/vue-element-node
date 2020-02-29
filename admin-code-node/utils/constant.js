const {env}=require('./env')

const UPLOAD_PATH= env==='dev' ? 'e:/nginx/upload/admin-upload-ebook' : '/nginx/upload/admin-ebook/ebook'
const UPLOAD_URL=env==='dev' ? 'https://initdream.cn/admin-upload-ebook':'https://www.initdream.cn/admin-upload-ebook/book/'
const OLD_UPLOAD_URL=env==='dev' ? 'https://initdream.cn/admin-upload-ebook/img':'https://initdream.cn/admin-upload-ebook'

module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS:0,
    debug:true,
    PWD_SALT:'admin_imooc_node',
    PRIVATE_KEY:'admin_imooc_node_test_youbaobao_xyz',
    JWT_EXPIRED:60 * 60, // token失效时间,单位为秒
    CODE_TOKEN_EXPIRED: -2,
    UPLOAD_PATH,
    MIME_TYPE_EPUB:'application/epub+zip',
    UPLOAD_URL,
    OLD_UPLOAD_URL
  }