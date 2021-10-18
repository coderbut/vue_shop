<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCatDialog"
            >添加分类
          </el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效模板 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级
          </el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"
            >编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCatDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <!-- 添加分类表单 -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              placeholder="不选择默认添加一级分类"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCatDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addcate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      cateList: [],
      // 总数据条数
      total: 0,
      // 为 table 指定类的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 表示将当前列自定义模板列
          type: "template",
          // 表示当前这一列使用模板的名称
          template: "isOk"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "opt"
        }
      ],
      // 添加分类对话框显隐
      addCatDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加对分类对名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 添加对分类的等级
        cat_level: 0
      },
      // 添加分类表单验证对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "请输入分类名称",
            trigger: "blur"
          }
        ]
      },
      // 保存父级分类数据
      parentCateList: [],
      // el-cascader 配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        // 父级分类和子级分类都可以选中
        checkStrictly: true
      },
      // 被选中的分类的 id 数组
      selectedKeys: []
    };
  },
  created() {
    this.getcateList();
  },
  methods: {
    // 获取商品分类数据
    async getcateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      // 将数据列表保存到 cateList 中
      this.cateList = res.data.result;
      // 总数据条数保存
      this.total = res.data.total;
    },
    // 监听 pagesize 的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getcateList();
    },
    // 监听 pagenum 的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getcateList();
    },
    // 点击按钮,暂时添加分类对对话框
    showAddCatDialog() {
      this.getParentCateList();
      this.addCatDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类列表失败！");
      }
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发的函数
    parentCateChanged() {
      //  如果 selectedKeys 数组的长度大于 0 ，则证明没有选择分类
      if (this.selectedKeys.length > 0) {
        // 如果长度不为 0 ，则证明选择了分类，取数组的最后一位，即所选择的最后一级分类
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 为当前分类等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮添加新的分类
    addcate() {
      // 提交前预校验
      this.$refs.addCateFormRef.validate(async validate => {
        if (!validate) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201)
          return this.$message.error("添加商品分类失败！");
        this.$message.success("添加商品分类成功！");
        this.getcateList();
        this.addCatDialogVisible = false;
      });
    },
    //  监听对话框的关闭事件，重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      // 重置分类框
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    }
  }
};
</script>

<style lang="less">
.treeTable {
  margin-top: 15px;
}

.el-cascader-menu {
  height: 300px;
  width: 200px;
}

.el-cascader {
  width: 100%;
}
</style>
