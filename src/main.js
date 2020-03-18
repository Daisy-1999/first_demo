import Vue from 'vue'   //加载node_modules的文件
import App from './App.vue'  //加载app.vue的文件
import router from './router'
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'

//导入字体图标
import './assets/fonts/iconfont.css'

//导入全局样式表
import './assets/css/global.css'

import axios from 'axios'
//配置i请求的根路径
//axios.defalults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

Vue.prototype.$http = axios

Vue.config.productionTip = false

//全局注册组件

new Vue({
  //把app根组件渲染到了页面上 同时把router路由挂载到了Vue实例

  router,
  render: h => h(App),
}).$mount('#app')
