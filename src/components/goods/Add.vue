<template>
    <div>
         <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 提示区 -->
            <el-alert
                title="添加商品信息" type="info" center show-icon :closable="false">
            </el-alert>
            <!-- 步骤条区 -->
            <!-- activeIndex - 0隐式转换 字符串用+-*/都可以将字符串转换为数字 -->
            <el-steps align-center :space="200" :active="activeIndex - 0" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- tabs栏区域 -->
            <el-form :model="addForm" :rules="addFormRules" 
            ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs :before-leave="beforeTabLeave" 
                v-model="activeIndex" :tab-position="'left'"
                @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                v-model="addForm.goods_cat"
                                :options="cateList"
                                :props="{ expandTrigger: 'hover', value: 'cat_id', 
                                children: 'children', label: 'cat_name' }"
                                @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTableDate"
                        :key="item.attr_id">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :label="cb" 
                                v-for="(cb, i) in item.attr_vals" :key="i">
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableDate" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action表示图片要上传到的后台API地址 -->
                        <el-upload
                            :headers="headerObj"
                            :action="uploadUrl"
                            :on-preview="handlePreview"
                            :on-success="handleSuccess"
                            :on-remove="handleRemove"
                            list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器组件 -->
                         <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                         <!-- 添加商品的按钮 -->
                         <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览 -->
        
        <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="50%">
        <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
// 深拷贝
import _ from 'lodash'
    export default {
        data() {
            return {
                //步骤条当前激活的步骤是指哪一个
                activeIndex: '0',
                //添加商品的表单数据对象
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_weight: 0,
                    goods_number: 0,
                    //商品所属的分类数组
                    goods_cat: [],
                    //图片的数组
                    pics: [],
                    // 商品的详情描述
                    goods_introduce: '',
                    attrs: []
                },
                //校验规则
                addFormRules: {
                    goods_name: [
                        { required: true, message: 
                        '请输入商品名称',trigger: 'blur'}
                    ],
                    goods_price: [
                        { required: true, message: 
                        '请输入商品价格',trigger: 'blur'}
                    ],
                    goods_weight: [
                        { required: true, message: 
                        '请输入商品重量',trigger: 'blur'}
                    ],
                    goods_number: [
                        { required: true, message: 
                        '请输入商品数量',trigger: 'blur'}
                    ],
                    goods_cat: [
                        {
                            required: true, message: 
                        '请选择商品分类', trigger: 'blur'}
                    ]
                },
                //商品分类列表
                cateList: [],
                //动态参数列表数据
                manyTableDate: [],
                //静态属性列表数组
                onlyTableDate: [],
                //上传图片的URL地址
                uploadUrl: 'https://www.liulongbin.top:8888/api/private/v1/upload',
                //图片上传组件的headers请求头对象
                headerObj: {
                    Authorization: 
                    window.sessionStorage.getItem('token')
                },
                previewPath: '',
                previewVisible: false
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            //获取所有商品分类数据
            async getCateList(){
                const {data: res} = await this.$http.get('categories')
                if(res.meta.status !== 200){
                    return this.$message.error('获取商品分类失败')
                }
                this.cateList = res.data
                //console.log(this.cateList)
            },
            //级联选择器选中项变化会触发这个函数
            handleChange(){
            // console.log(this.addForm.goods_cat)
                if(this.addForm.goods_cat.length !== 3){
                    this.addForm.goods_cat = []
                    }
            },
            beforeTabLeave(activeName, oldActiveName){
               if(oldActiveName === '0' && 
               this.addForm.goods_cat.length !== 3){
                   this.$message.error('请选择商品分类')
                   return false
               }
            },
            //会获得一个activeIndex指向当前标签的页码
            async tabClicked(){
                //证明访问的是动态参数面板
                //console.log(this.activeIndex)
                if(this.activeIndex === '1'){
                    const {data: res} = await
                    this.$http.get(`categories/
                    ${this.cateId}/attributes`,
                    {params: {sel: 'many'}})
                    if(res.meta.status !== 200){
                        return this.$message.error('获取动态参数列表失败')
                    }
                    //console.log(res.data)
                    res.data.forEach(item => {
                        item.attr_vals = item.attr_vals.length ===0 ?
                        [] : item.attr_vals.split(' ')
                    })
                    this.manyTableDate = res.data
                } else if(this.activeIndex === '2'){
                    const {data: res} = await
                    this.$http.get(`categories/
                    ${this.cateId}/attributes`,
                    {params: {sel: 'only'}})
                    if(res.meta.status !== 200){
                        return this.$message.error('获取静态参数列表失败')
                    }
                    console.log(res.data)
                    this.onlyTableDate = res.data
                }

            },
            //处理图片预览事件
            handlePreview(file){
                console.log(file)
                this.previewPath = file.response.data.url
                this.previewVisible = true

            },
            //处理移除图片的操作
            //监听删除图片事件 自带有2个参数可查看文档
            handleRemove(file){
                //1，获取将要删除的图片的临时路径
                const filePath = file.response.data.tmp_path
                //2，从pics数组中，找到这个图片对应的索引值
                const i = this.addForm.pics.findIndex(x => 
                x.pic === filePath)
                //3，调用数组的splice方法，把图片信息对象，从pics数组中删除
                this.addForm.pics.splice(i, 1)
                //console.log(this.addForm)
            },
            //监听图片上传成功的事件 自带有三个参数可查看文档
            handleSuccess(response){
                //1,先拼接得到一个图片信息对象
                const picInfo = {pic: response.data.tmp_path}
                //2,将图片信息对象，Push 到 pics数组中去
                this.addForm.pics.push(picInfo)
                //console.log(this.addForm)
            },
            //进行表单的预验证
            add(){
                this.$refs.addFormRef.validate(async valid => {
                    if(!valid){
                        return this.$message.error('请输入必填的表单数据')
                    }
                    //执行添加的业务逻辑
                    //将数组转换为字符串只需要加一个join
                    //lodash cloneDeep(obj)
                    const form = _.cloneDeep(this.addForm)
                    form.goods_cat = 
                    form.goods_cat.join(',')
                    //处理动态参数
                    this.manyTableDate.forEach(item => {
                        const newInfo = { attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')}
                        this.addForm.attrs.push(newInfo)
                    })
                    //处理静态属性
                    this.onlyTableDate.forEach(item => {
                        const newInfo = { attr_id: item.attr_id,
                        attr_value: item.attr_vals}
                        this.addForm.attrs.push(newInfo)
                    })
                    form.attrs = this.addForm.attrs
                    console.log(form)
                    //发起请求 添加商品
                    //商品的名称必须是唯一的
                    const {data: res} = await this.$http.post('goods', form)
                    if(res.meta.status !== 201){
                        return this.$message.error('添加商品失败')
                    }
                    this.$message.success('添加商品成功')
                    this.$router.push('/goods')
                })
            }

        },
        computed: {
            cateId(){
                if(this.addForm.goods_cat.length === 3){
                    return this.addForm.goods_cat[2]
                }
                return null
            }
        }
        
    }
</script>

<style lang="less" scoped>
.el-checkbox{
    margin: 0 8px 0 0 !important;
}
.previewImg{
    width: 100%;
    height: 100%;
}
.btnAdd{
    margin-top: 15px;
}
</style>