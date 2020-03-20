<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 搜索与添加区 -->
            <el-row :gutter="20">
                <el-col :span = "7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
                    </el-input>
                </el-col>
                <el-col :span = "4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>
            
            <!-- 用户列表区 -->
            <el-table :data = "userList" border stripe>
                <el-table-column type="index"></el-table-column>    //添加索引列 只需要加一个type = index
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态" prop="mg_state">
                        <!-- 新版vue用v-slot这是作用域插槽中定义一个对象(这里对象被定义为scope)来存储插槽上绑定的数据的用法 -->
                    <template v-slot="slot">   
                        <!-- {{ slot.row }}      -->
                        <!-- "当前行数据的获取也会用到插槽,scope相当于一行的数据， scope.row相当于当前行的数据对象," -->
                        <el-switch @change="userStateChanged(slot.row)" v-model="slot.row.mg_state"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template v-slot="slot">
                        <!-- 修改按钮 -->
                        <el-button size="mini"  @click="showEditDialog(slot.row.id)" type="primary" icon="el-icon-edit"></el-button>
                        <!-- 删除按钮 -->
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(slot.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination @size-change="handleSizeChange"  @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                            :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" 
                            layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加用户的对话框 -->
        <!-- 对话框中有个专门的关闭对话框事件close -->
        <el-dialog @close="addDialogClosec" title="添加用户" :visible.sync="addDialogVisible" width="50%">
            <!-- 弹框主题区域 弹出一个表单项 让用户输入-->
           
            <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addFrom.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addFrom.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addFrom.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addFrom.mobile"></el-input>
                </el-form-item>
            </el-form>

            <!-- 对话框底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser" >确 定</el-button>
            </span>
        </el-dialog>
        
        <!-- 修改用户对话框 -->

        <el-dialog title="修改用户" :visible.sync="editDialogVisible"
                 width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules"
                label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" prop="username"></el-input>
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="editForm.email" prop="email"></el-input>
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="editForm.mobile" prop="mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        data() {
            //验证邮箱规则
            var checkEmail = (rule, value, cb) =>{
                const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9-])+/
                if(regEmail.test(value)){
                    //合法的邮箱
                    return cb()
                }
                cb(new Error('请输入合法的邮箱'))
            };
            //验证手机号的规则
            var checkMobile = (rule, value, cb) => {
                const regMobile = /^1[3456789]\d{9}$/
                if(regMobile.test(value)){
                    return cb()
                }
                cb(new Error('请输入合法的手机号码'))
            };
            return {
                //获取用户列表参数对象
                queryInfo: {
                    query: '',
                    //当前的页数
                    pagenum: 1,
                    //当前的页面数据的条数
                    pagesize: 2
                },
                userList: [],
                total: 0,
                //控制用户对话框的显示隐藏
                addDialogVisible: false,
                //添加用户的表单数据
                addFrom :{
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                //给注册的用户添加规则
                addFromRules: {
                    username:[
                        {required: true, message: "请输入用户名", trigger:'blur'},
                        {min: 3, max:10, message: '用户名的长度在3~10个字符之间', trigger: 'blur'}
                    ],
                    password:[
                        {required: true, message: "请输入密码", trigger:'blur'},
                        {min: 5, max:15, message: '密码的长度在6~15个字符之间', trigger: 'blur'}
                    ],
                    email:[
                        {required: true, message: "请输入邮箱", trigger:'blur'},
                        {validator: checkEmail, message: '请输入正确的邮箱', trigger: 'blur'}
                    ],
                    mobile:[
                        {required: true, message: "请输入电话号码", trigger:'blur'},
                        {validator:checkMobile, message: '请输入正确的手机号码', trigger: 'blur'}
                    ]
                },
                //控制修改用户对话框的显示与隐藏
                editDialogVisible: false,
                //查询到的用户信息对象
                editForm: {},
                //修改表单的验证规则
                editFormRules: {
                    username:[
                        {required: true, message: "请输入用户名", trigger:'blur'},
                        {min: 3, max:10, message: '用户名的长度在3~10个字符之间', trigger: 'blur'}
                    ],
                    email:[
                        {required: true, message: "请输入邮箱", trigger:'blur'},
                        {validator: checkEmail, message: '请输入正确的邮箱', trigger: 'blur'}
                    ],
                    mobile:[
                        {required: true, message: "请输入电话号码", trigger:'blur'},
                        {validator:checkMobile, message: '请输入正确的手机号码', trigger: 'blur'}
                    ]
                }
            }
        },
        created() {
            this.getUserList()
        },
        methods: {
            async getUserList(){
                const { data: res} = await this.$http.get('users', { params: this.queryInfo })
                console.log(res)
                if(res.meta.status !== 200) return this.$message.erro('获取用户列表失败')
                this.userList = res.data.users;
                this.total = res.data.total
            },
            // 监听 pagesize 每一页显示多少条数据 改变事件
            handleSizeChange(newSize){
                this.queryInfo.pagesize = newSize;
                this.getUserList()
                //console.log(newSize)
            },
            //监听页码值改变的事件
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.getUserList()
                //console.log(newPage)
            },
            //监听switchChangesd 开关状态的改变 开关更改状态需要保存到数据库中
            async userStateChanged(userinfo){
                const {data: res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
                if(res.meta.status !== 200) {
                    userinfo.mg_state = !userinfo.mg_state
                    return this.$message.error("更新用户失败！")
                }
                this.$message.success("更新用户状态成功")
            },
            //监听添加用户对话框的关闭事件
            addDialogClosec(){
                this.$refs.addFromRef.resetFields()
            },
            //点击按钮，添加新用户
            addUser(){
                //vaildate是一个对表单进行校验的方法 成功的话返回一个true,否则false
                this.$refs.addFromRef.validate(async valid =>{
                    if(!valid) return
                    //可以发起添加用户的网络请求
                    const {data: res}= await this.$http.post('users', this.addFrom)
                    if(res.meta.status !== 201){
                        this.$message.error('添加用户失败')
                    }
                    this.$message.success('添加用户成功')
                    //关闭对话框 将data里的属性定义在确定按钮里
                    this.addDialogVisible = false
                    //重新刷新列表获取用户列表
                    this.getUserList()

                })
            },
            //展示编辑的对话框
            async showEditDialog(id){
                this.editDialogVisible = true
                //console.log(id)
                const {data: res} = await this.$http.get('users/' + id)
                if(res.meta.status !== 200){
                    return this.$message.error('查询用户失败')
                }
                this.editForm = res.data
            },
            //监听对话框的关闭事件
            editDialogClosed(){
                this.$refs.editFormRef.resetFields()
            },
            //修改用户信息并提交
            editUserInfo(){
                //关闭对话框
                this.editDialogVisible = false
                this.$refs.editFormRef.validate(async valid => {
                    if(!valid) return
                    //发起修改用户信息的数据请求
                    const {data: res} = await this.$http.put('users/' + this.editForm.id, {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile
                    })
                    if(res.meta.status != 200){
                        this.$message.error('更新信息失败')
                    }
                    this.$message.success('更新信息成功')
                    //更新数据列表
                    this.getUserList();
                })
            },
            //根据id删除对应的用户
            async removeUserById(id){
                //弹框询问用户是否删除用户
                const confirmResult = await this.$confirm(
                    '此操作将永久删除该用户, 是否继续?', 
                    '提示', 
                    {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    }
                ).catch( err =>  err )
                //如果用户确认删除，则返回字符串 confirm
                //如果用户确认去取消，则返回字符串 cancle
                //console.log(confirmResult)
                if(confirmResult !== "confirm"){
                    return this.$message.info('已经取消删除')
                }
                const { data: res} = await this.$http.delete('users/' + id)
                if(res.meta.status !== 200){
                this.$message.error('删除用户失败')

                }
                this.$message.success('删除用户成功')
                this.getUserList()
                
            }
        }
    }
</script>

<style lang="less" scoped>
.el-card{
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
}
</style>