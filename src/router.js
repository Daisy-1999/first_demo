import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Roles from './components/power/Roles.vue'
import Rights from './components/power/Rights.vue'
import Cate from './components/goods/Cate.vue'

Vue.use(Router)

//将 export default 和 new Router拆分 将beforeEach重新挂载到router上
const router = new Router({
    routes:[
        { path: '/', redirect: '/login'},
        { path: '/login', component:Login },
        //路由重定向 在进入到/home是 就同时切换到/welcome同时显示welcome组件
        { 
            path: '/home', 
            component:Home, 
            redirect: '/welcome',
            children:[{ path: '/welcome', component: Welcome }, { path: '/users', component: Users},
                      { path: '/roles', component: Roles }, { path: '/rights', component:Rights},
                      { path: '/categories', component: Cate }
                     ]
        }
    ]
})
 //路由导航守卫 如果没有登录，但是直接通过URL访问特定的页面，需要重新登录导航到登录页面
//next ()是放行

router.beforeEach((to, from, next) => {
    //to 将要访问的路径
    //from 代表从哪个路径跳转而来
    //next 是一个函数 表示放行

    if(to.path === '/login') return next()
    //获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if(!tokenStr) return next('/login')
    next()
})

export default router