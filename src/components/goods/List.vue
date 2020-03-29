<template>
    <div>
          <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>   
            <el-row :gutter="20">
                <el-col :span=8>
                    <el-input v-model="queryInfo.query"
                    clearable @clear="getGoodsList" placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span=4>
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- table 表格区域 -->
            <el-table :data="goodslist" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name">

                </el-table-column>
                <el-table-column width="95px" label="商品价格(元)" prop="goods_price"></el-table-column>
                <el-table-column width="70px" label="商品重量" prop="goods_weight"></el-table-column>
                <el-table-column width="140px" label="创建时间" prop="add_time">
                    <template v-slot="slot">
                        <!-- |在vue里是一个管道符号,前面为你要过滤的值,后面是过滤器,所谓过滤就是你筛选后的值 -->
                        {{ slot.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template v-slot="slot">
                        <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                        @click = "removeById(slot.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区 -->
             <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //查询参数对象
                queryInfo: {
                    //input里的内容
                    query: '',
                    //当前页码
                    pagenum  : 1,
                    //每页显示条数
                    pagesize : 10,
                },
                //商品列表
                goodslist: [],
                //总数居条数
                total: 0
            }
        },
        created() {
            this.getGoodsList()
        },
        methods: {
            //根据分页获取对应的商品列表
            async getGoodsList(){
                //参数对象的话都要添加一个params
                const {data: res} = await this.$http.get('goods', { params: this.queryInfo})
                if(res.meta.status !== 200){
                    return this.$message.error('获取商品列表失败')
                }
                //this.$message.success('获取商品列表成功！')
                //console.log(res.data)
                this.goodslist = res.data.goods
                this.total = res.data.total
                this.pagenum = res.data.pagenum
            },
            handleSizeChange(newSzie){
                this.queryInfo.pagesize = newSzie
                this.getGoodsList()
            },
            handleCurrentChange(newPage){
                this.queryInfo.pagenum = newPage
                this.getGoodsList()
            },
            async removeById(id){
                const confirmResult = await this.$confirm(
                    '此操作将永久删除该文件, 是否继续?', '提示', 
                {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(err => err)
                if(confirmResult !== 'confirm'){
                    return this.$http.$$message('用户已取消删除')
                }

                const {data: res} = await 
                this.$http.delete(`goods/${id}`)
                if(res.meta.status !== 200){
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getGoodsList()
            },
            goAddPage(){
                this.$router.push('/goods/add')
            }
        }
    }
</script>

<style lang="less" scoped>

</style>