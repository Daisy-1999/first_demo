<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/home_logo.jpg" alt="">
                <span>电商系统管理后台</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <!-- 判断是否折叠了起来 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区域 -->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409Eff" 
                unique-opened :collapse="isCollapse" :collapse-transition="false" 
                router default-active="$route.path">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                        <!-- 一级菜单模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>

                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span> {{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧主题内容 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>

</template>
        //通过接口获取数据菜单 通过axios请求拦截添加token,保证拥有获取数据的权限
        //相当于一次预处理
<script>
    export default {
        data() {
            return {
                menuList: [],
                //一级菜单的icon图标 通过定义一个对象，每个一级菜单的ID都是不一样的所以通过id来循环图表样式
                iconObj: {
                    '125': 'iconfont icon-users',
                    '103': 'iconfont icon-tijikongjian',
                    '101': 'iconfont icon-shangpin',
                    '102': 'iconfont icon-danju',
                    '145': 'iconfont icon-baobiao'
                },
                //是否折叠
                isCollapse: false
            }
        },
        //生命周期函数
        created() {
            this.getMenuList()
        },
        methods: {
            logout(){
                this.$router.push('./login')
            },
            //获取所有的菜单
            async getMenuList(){
                const { data: res } = await this.$http.get('menus')
                if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.menuList = res.data;
                //console.log(res);
            },
            //点击按钮，切换菜单的折叠与展开
            toggleCollapse(){
                this.isCollapse = !this.isCollapse
            },
        }
    }
</script>

<style lang="less" scoped>
.home-container{
    height: 100%;
}
.el-header{
    background-color: #373d42;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    >div{
        display: flex;
        align-items: center;
        span{
            margin-left: 15px;
        }
    }
    img{
        width: 50px;
        height: 50px;
        border-radius: 50%;
    }
}
.el-aside{
    background-color: #333744;
    .el-menu{
        border-right: none;
    }
}
.el-main{
    background-color: #eaedf1;
}
.iconfont{
    margin-right: 10px;
}
.toggle-button{
    background-color: 4A5064;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    color: #fff;
    letter-spacing: 0.2em;
    cursor: pointer;
    }
</style>