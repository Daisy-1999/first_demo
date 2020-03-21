<template>
    <div>
          <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色管理</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="roleList" border stripe="">
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template v-slot="slot">
                        <el-row :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item, index) in slot.row.children" :key="item.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span = "5">
                                <el-tag closable @close="removeRightById(slot.row, item.id)">{{ item.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级三级权限 -->
                            <el-col :span = "19">
                                <!-- 通过循环渲染二级权限 -->
                                <el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(slot.row, item2.id)"> {{ item2.authName }} </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 通过循环渲染三级权限 -->
                                     <el-col :span="18">
                                         <el-tag closable type="warning" :class="[index3 === 0 ? '' : 'bdtop', 'mgright']"
                                          v-for="(item3, index3) in item2.children" :key="item3.id"
                                          @close="removeRightById(slot.row, item3.id)">
                                             {{item3.authName}}
                                         </el-tag>
                
                                     </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                       
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template v-slot="slot">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" 
                        icon="el-icon-setting" @click="showSetRightDiaog(slot.row)">
                            分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限对话框 -->
        <el-dialog  @close="setRightDialogClosed"
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%">
        <!-- 树形控件 -->
        <el-tree show-checkbox node-key="id" default-expand-all ref="treeRef"
         :data="rightsList" :default-checked-keys="defKeys" :props="treeProps"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //所有角色列表数据
                roleList: [],
                //控制分配权限对话框的显示与隐藏 false 隐藏
                setRightDialogVisible: false,
                //从接口处返回的全部的权限的数据
                rightsList: [],
                //树形控件的属性绑定对象
                treeProps: {
                    label: 'authName',
                    children: 'children'
                },
                //默认选中的节点Id数值组
                defKeys: [],
                //当前即将分配权限的角色
                roleId: ''
            }
        },
        created(){
            this.getRoleList()
        },
        methods: {
            //获取所有角色的列表
            async getRoleList(){
               const {data: res} = await this.$http.get('roles')
               if(res.meta.status !== 200){
                   return this.$message.error('获取角色列表失败')
               }

               this.roleList = res.data
               //console.log(this. roleList)
            },
            //根据id删除相应的权限
            
           async removeRightById(role, rightId){
                //弹框提示用户是否要删除
                const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(err => err)
                if(confirmResult !== 'confirm'){
                    return this.$message.info('取消了删除')
                }

                const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if(res.meta.status !== 200){
                    return this.$message.error('删除权限失败')
                }
                //使用这个会使页面重新渲染
                //this.getRoleList();
                //console.log(role)
                role.children = res.data
                this.$message.success('已经成功删除')
            },
            //展示分配权限对话框
            async showSetRightDiaog(role){
                this.roleId = role.id
                //获取所有权限的数据
                const { data: res} = await this.$http.get('rights/tree')
                if(res.meta.status !== 200){
                    return this.$message.error('获取权限数据失败')
                }
                //把获取到的权限数据保存到data中
                this.rightsList = res.data
                //console.log(this.rightsList)

                //递归获取三级节点的id
                this.getLeafKeys(role, this.defKeys)
                this.setRightDialogVisible = true
            },
            //通过递归的形式，获取角色列表下所有三级权限的id，
            //并保存到 defKeys 数组中
            getLeafKeys(node, arr){
                //如果当前 node 不包含children属性，则是三级节点
                if( !node.children ){
                    return arr.push(node.id)
                }

                node.children.forEach(item => 
                this.getLeafKeys(item, arr))
            },
            //监听分配对话框的关闭事件 使得defKeys重新清空
            //不会影响到下一个分配权限
            setRightDialogClosed(){
                this.defKeys = []
            },
            //点击为角色分配权限
            async allotRights(){
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedNodes()
                ]
                const idStr = keys.join(',')
                const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, 
                { rids:idStr })
                if(res.meta.status !== 200){
                    return this.$message.error('分配权限失败')
                }

                this.$message.success('分配权限成功')
                this.setRightDialogVisible = false
                this.getRoleList();
            }
            
        }
    }
</script>

<style lang="less" scoped>
.el-tag{
    margin-top: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
.mgright{
    margin-right: 10px;
}
</style>