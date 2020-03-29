import Vue from 'vue'   //加载node_modules的文件
import App from './App.vue'  //加载app.vue的文件
import router from './router'
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


//导入字体图标
import './assets/fonts/iconfont.css'

//导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'


          //通过接口获取数据菜单 通过axios请求拦截添加token,保证拥有获取数据的权限
        //相当于一次预处理
        //发送请求时如果请求头的Authorization没有token的话服务器会驳回你的请求
axios.interceptors.request.use(config =>{
  //console.log(config)
  //在最后必须return config
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config
})


//将根路径挂载到$http中
Vue.prototype.$http = axios

Vue.config.productionTip = false

//注册为全局可用的组件
Vue.component('tree-table', TreeTable)
//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

//全局注册组件

//将时间改为标准时间格式
Vue.filter('dateFormat', function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours()+ '').padStart(2, '0')
  const mm = (dt.getMinutes()+ '').padStart(2, '0')
  const ss = (dt.getSeconds()+ '').padStart(2, '0')
  // return `yyyy-mm-dd hh:mm:ss`
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

})
new Vue({
  //把app根组件渲染到了页面上 同时把router路由挂载到了Vue实例

  router,
  render: h => h(App),
}).$mount('#app')
