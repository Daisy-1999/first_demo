<template>
    <div>
         <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 头部的警告区域 -->
            <el-alert :closable="false" show-icon
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning">
            </el-alert>
            <!-- 选择商品分类区域 -->
            <el-row>
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader
                        v-model="slectedCateKeys"
                        :options="cateList"
                        :props="{ expandTrigger: 'hover',
                        label: 'cat_name', value:'cat_id', children: 'children' 
                        }"
                        @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>

            <!-- tab 页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="first">
                    <!-- 添加参数的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled">
                        添加参数
                    </el-button>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="second">
                    <!-- 添加参数的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled">
                        添加属性
                    </el-button>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {

                //通过$http.get('categories')请求
                //得到的数据列表保存在里面
                cateList: [],
                //级联选择框双向绑定到的数组
                slectedCateKeys: [],
                //被激活的页签的名称
                activeName: 'first'
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            //获取所有商品分类列表
            async getCateList(){
                const {data: res} = await this.$http.get('categories')
                if(res.meta.status !== 200){
                    return this.$message.error('获取商品分类失败')
                }
                this.$message.success('获取商品分类成功')
                this.cateList = res.data
            },
            //级联选择框选中项变化，会触发这个函数
            handleChange(){
                if(this.slectedCateKeys.length !==3){
                    this.slectedCateKeys = []
                    return 
                }
                //证明选中的就是三级分类
            },
            //这是tab页签点击事件的处理函数
            handleTabClick(){

            }
        },
        //如果按钮需要被禁用，则返回true, 否则返回false
        computed:{
            isBtnDisabled(){
                if(this.slectedCateKeys.length !== 3){
                    return true
                }
                return false
            },
            
        }
    }
</script>

<style lang="less" scoped>
.el-row{
    margin: 15px 0
}
</style>