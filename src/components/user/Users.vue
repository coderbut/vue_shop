<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 使用element的栅格系统控制元素的占位大小 -->
      <!-- :gutter 控制元素之间的间隙 -->
      <el-row :gutter="10">
        <el-col :span="9">
          <!-- 搜索与添加区域 -->
          <!-- 实现用户的搜索功能，使用为 queryInfo.query 赋值，调用getUserList方法获取 -->
          <!-- 实现搜索框重置并重置搜索结果 clearable 和 @clear 事件 -->
          <el-input
            v-model="queryInfo.query"
            clearable
            placeholder="请输入内容"
            @clear="getUserList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList()"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
          >添加用户
          </el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip
              :enterable="false"
              content="编辑"
              effect="dark"
              placement="top"
            >
              <el-button
                icon="el-icon-edit"
                size="mini"
                type="primary"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip
              :enterable="false"
              content="删除"
              effect="dark"
              placement="top"
            >
              <el-button
                icon="el-icon-delete"
                size="mini"
                type="danger"
                @click="removeUserById(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 分配权限按钮 -->
            <el-tooltip
              :enterable="false"
              content="分配角色"
              effect="dark"
              placement="top"
            >
              <el-button
                icon="el-icon-setting"
                size="mini"
                type="warning"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 3, 5, 10]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <!-- 对话框关闭之后执行的方法 @close -->
    <el-dialog
      :visible.sync="addDialogVisible"
      title="添加用户"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 内容底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      :visible.sync="editDialogVisible"
      title="修改用户信息"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      :visible.sync="setRoleDialogVisible"
      title="分配角色"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的校验规则
    let checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      // 通过 value 值判断是否合法，调用 cb（callback）函数
      if (regEmail.test(value)) return cb();
      cb(new Error("请输入合法邮箱"));
    };
    // 验证手机号的校验规则
    let checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) return cb();
      cb(new Error("请输入合法的手机号"));
    };
    return {
      // 获取用户列表的参数
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的显示和隐藏
      addDialogVisible: false,
      // 添加用户的表单数据对象
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 添加表单验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: "请输入用户名",
            tirgger: "blur"
          },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            tirgger: "blur"
          },
          {
            min: 6,
            max: 15,
            message: "长度在 6  到 15 个字符",
            trigger: "blur"
          }
        ],
        email: [
          {
            required: true,
            message: "请输入邮箱",
            tirgger: "blur"
          },
          // 使用自定义验证
          {
            validator: checkEmail,
            trigger: "blur"
          }
        ],
        mobile: [
          {
            required: true,
            message: "请输入手机号",
            tirgger: "blur"
          },
          {
            validator: checkMobile,
            trigger: "blur"
          }
        ]
      },
      // 控制修改用户对话框的显示和隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      editFormRules: {
        email: [
          {
            required: true,
            message: "请输入邮箱",
            tirgger: "blur"
          },
          {
            validator: checkEmail,
            tirgger: "blur"
          }
        ],
        mobile: [
          {
            required: true,
            message: "请输入用户手机",
            trigger: "blur"
          },
          {
            validator: checkMobile,
            trigger: "blur"
          }
        ]
      },
      // 分配角色对话框显隐
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 获取到的角色列表
      rolesList: [],
      // 已选中的角色 id 值
      selectedRoleId: ""
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      // 请求用户列表数据并解构
      const {data: res} = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200)
        return this.$message.console.error("获取用户列表失败");
      this.userList = res.data.users;
      this.total = res.data.total;
      // console.log(res);
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听 switch 状态的改变
    async userStateChange(userInfo) {
      // console.log(userInfo);
      // 调用端口更改用户状态
      const {data: res} = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      // console.log(res);
      // 判断用户状态是否更改成功
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },
    // 监听整个添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 表单提交前的预校验
    addUser(addForm) {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        // 如果没有直接 return 则发起添加用户的网络请求
        const {data: res} = await this.$http.post("users", this.addForm);
        if (res.meta.status != 201)
          return this.$message.error("添加用户失败！");
        this.$message.success("添加用户成功！");
        // 隐藏添加用户对话框
        this.addDialogVisible = false;
        // 刷新列表
        this.getUserList();
      });
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id);
      this.editDialogVisible = true;
      const {data: res} = await this.$http.get("users/" + id);
      console.log(res);
      if (res.meta.status != 200)
        return this.$message.error("获取用户信息失败！");
      this.editForm = res.data;
    },
    // 监听修改用户表单的关闭事件
    editDialogClosed() {
      // 关闭之后重置表单
      this.$refs.editFormRef.resetFields();
    },
    editUserInfo(id) {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid);
        if (!valid) return;
        const {data: res} = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );
        if (res.meta.status != 200)
          return this.$message.error("修改用户信息失败！");
        /**
         * 验证通过之后的步骤
         * 1. 关闭对话框
         * 2. 刷新用户列表数据
         * 3. 提示修改成功
         */
        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success("修改用户信息成功！");
      });
    },
    // 根据 id 删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "即将删除用户",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err /** 箭头函数简写，捕获异常并返回异常 */);
      // 如果用户确认删除，则返回字符串 "confirm"
      // 取消删除，返回 "cancel"
      // console.log(confirmResult);
      if (confirmResult !== "confirm")
        return this.$message.info("已取消删除！");
      const {data: res} = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败！");
      this.$message.success("删除用户成功！");
      this.getUserList();
    },
    // 展示分配角色对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;
      // console.log(userInfo);
      //在展示对话框之前，获取所有角色列表
      const {data: res} = await this.$http.get("roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败！");
      this.rolesList = res.data;
      // console.log(this.rolesList);
      this.setRoleDialogVisible = true;
    },
    // 点击按钮分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId)
        return this.$message.error("请选择要分配的角色！");
      const {data: res} = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      );
      // 他妈的admin无法修改，我还以为接口出错了或者我的参数有问题！！！
      // console.log(res.meta);  output "管理员账户无法修改" 400
      if (res.meta.status !== 200) return this.$message.error("更新角色失败！");
      this.$message.success("更新角色成功！");
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    // 监听分配角色对话框的关闭
    setRoleDialogClosed() {
      this.selectedRoleId = "";
      this.userInfo = [];
    }
  }
};
</script>

<style lang="less" scoped></style>
