<template>
    <div>
         <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCatDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格 -->
            <tree-table :data="cateList" :columns="columns"
            :selection-type="false" :expand-type="false" 
            show-index index-text="#" border class="treeTable">
            <!-- 是否有效的模板 -->
                <template v-slot:isok="slot" >
                    <i style="color: green" class="el-icon-success"
                    v-if="slot.row.cat_deleted === false">
                    </i>
                    <i style="color: green" class="el-icon-error" v-else></i>
                </template>
                <!-- 排序的模板 -->
                <template v-slot:order="slot" >
                    <el-tag size="mini" v-if="slot.row.cat_level === 0">一级</el-tag>
                    <el-tag size="mini"  v-else-if="slot.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag size="mini" v-else type="warning">三级</el-tag>
                </template>
                <!-- 操作的模板 -->
                <template v-slot:opt="slot">
                    <el-button :id="slot.row.cat_id" type="primary" icon="el-icon-edit"
                    size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete"
                    size="mini">删除</el-button>
                </template>
            </tree-table>


            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog
            title="添加分类" @close="addCateDialogClosed"
            :visible.sync="addCatDialogVisible"
            width="50%">
            <!-- 添加分类的表单 -->
            <el-form ref="addCateFromRef" :model="addCateFrom" label-width="100px"
            :rules="addCateFromRules">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateFrom.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options 指定数据源 -->
                    <!-- props 指定级联选择器的配置对象 -->
                    <el-cascader
                        clearable
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="{ expandTrigger: 'hover', 
                        children:'children', label: 'cat_name', 
                        value: 'cat_id'}"
                        @change="parentCateChanged">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCatDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //商品分类的数据列表，默认为空
               cateList: [],
               //默认查询条件
               querInfo: {
                    type:3,
                    pagenum: 1,
                    pagesize: 5
               },
               //总数据条数
               total: 0,
               //为table 指定列的定义
               columns: [
                   {
                   label: '分类名称',
                   prop: 'cat_name'
               },{
                   label: '是否有效',
                   //表示 将当前列定义为模板列
                   type: 'template',
                   //表示当前这一列使用的模板名称 isok插槽的名字
                   template: 'isok'
                    },{
                        label: '排序',
                        type: 'template',
                        template: 'order'
                    },{
                        label: '操作',
                        type: 'template',
                        template: 'opt'
                    }
                ],
                //控制添加分类对话框的显示与隐藏
                addCatDialogVisible: false,
                //添加分类的表单数据对象
                addCateFrom: {
                    //将要添加的分类的名称
                    cat_name: '',
                    //父级分类的ID
                    cat_pid: 0,
                    //当前默认添加的等级分类是一级分类
                    cat_level: 0

                },
                //添加分类表单的验证规则对象
                addCateFromRules: {
                    cat_name: [
                        {
                            required: true, message:'请输入分类的名称',
                            trigger: 'blur'
                        }
                    ]
                },
                //将对话框级联里的数据放在数组里 父级分类的列表
                parentCateList: [],
                //选中的父级分类的ID数组
                selectedKeys: []
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            //获取商品分类数据
            async getCateList(){
                const { data: res} = await this.$http.get('categories', { params: this.querInfo })
                if( res.meta.status !== 200){
                    return this.$message.error('获取商品分类失败！')
                }

                //this.cateList = res.data
                //console.log(res.data)
                //把数据列表赋值给catList
                this.cateList = res.data.result
                //为总数据条数赋值
                this.total = res.data.total
                
            },
            //监听pagesize改变
            handleSizeChange(newSize){
                this.querInfo.pagesize = newSize
                this.getCateList()
            },
            //监听pagenum的改变
            handleCurrentChange(newPage){
                this.querInfo.pagenum = newPage
                this.getCateList()
            },
            //点击按钮，展示添加分类的对话框
            showAddCatDialog(){
                //获取父级分类的数据列表 再展示出对话框
                this.getParentCateList()
                this.addCatDialogVisible = true
            },
            //获取父级分类的数据列表
            async getParentCateList(){
                const {data: res} = await this.$http.get(
                    'categories', {params: {type: 2}})
                if(res.meta.status !== 200){
                    return this.$message.error('获取父级分类数据失败')    
                }
                this.parentCateList = res.data
            },
            //选择项发生变化触发这个函数
            parentCateChanged(){
                //如果 selectedKeys 数组中的length > 0, 证明选中
                //了父级分类，反之就说明没有选中任何父级分类
                if(this.selectedKeys > 0){
                    //父级分类的id
                    this.addCateFrom.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
                    //为当前分类的等级赋值
                    this.addCateFrom.cat_level = this.selectedKeys.length
                    return
                }else{
                    //父级分类的id
                    this.addCateFrom.cat_pid = 0
                    //为当前分类的等级赋值
                    this.addCateFrom.cat_level = 0
                }
            },
            //点击按钮添加新的分类
            addCate(){
                //进行预验证
                this.$refs.addCateFromRef.validate(async valid =>{
                    if(!valid) return
                    const {data: res} = await this.$http.post('categories', this.addCateFrom)
                    if(res.meta.status !== 201){
                        return this.$message.error('添加分类失败')
                    }
                    this.$message.success('添加分类成功')
                    this.getCateList()
                    this.addCatDialogVisible = false

                })
                
            },
            //监听对话框的关闭事件，重置表单数据
            addCateDialogClosed(){
                this.$refs.addCateFromRef.resetFields()
                this.selectedKeys = []
                this.addCateFrom.cat_level = 0
                this.addCateFrom.cat_pid = 0
            }
        }
    }
</script>

<style lang="less" scoped>
.treeTable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>