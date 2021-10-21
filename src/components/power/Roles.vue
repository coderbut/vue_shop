<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <!-- 添加角色按钮功能完成 -->
          <el-button type="primary" @click="addRolesDIalogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 为第一行添加上边框线，以及为每一行添加下边框线 -->
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环嵌套渲染二级权限 -->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      type="warning"
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
              <!-- <pre>{{ scope.row }}</pre> -->
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 角色编辑和删除按钮完成 -->
            <el-button
              icon="el-icon-edit"
              size="mini"
              type="primary"
              @click="showEditDialog(scope.row.id)"
              >编辑
            </el-button>
            <el-button
              icon="el-icon-delete"
              size="mini"
              type="danger"
              @click="removeRole(scope.row.id)"
              >删除
            </el-button>
            <el-button
              icon="el-icon-setting"
              size="mini"
              type="warning"
              @click="showSetRightDialog(scope.row)"
              >分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="addRolesDIalogVisible"
      width="50%"
      @close="closeRolesDialog"
    >
      <el-form
        :model="addRolesForm"
        :rules="addRolesFormRules"
        ref="addRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="添加角色：" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述：" prop="roleDesc">
          <el-input
            v-model="addRolesForm.roleDesc"
            placeholder="可选"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDIalogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesVisible" width="50%">
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      :visible.sync="setRightDialogVisible"
      title="分配权限"
      width="50%"
      @close="closeRightDialog"
    >
      <!-- 树形权限列表 -->
      <el-tree
        ref="treeRef"
        :data="rightList"
        :default-checked-keys="defKeys"
        :props="treeProps"
        default-expand-all
        node-key="id"
        show-checkbox
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 删除权限对话框显隐
      setRightDialogVisible: false,
      // 所有权限数据
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 默认选中的节点的 id 值
      defKeys: [],
      // 当前即将分配权限的 id
      roleId: "",
      // 添加角色对话框显隐
      addRolesDIalogVisible: false,
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      addRolesFormRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "blur",
          },
        ],
      },
      editRolesVisible: false,
      editRolesForm: {
        roleId: "",
        roleName: "",
        roleDesc: "",
      },
      editRolesFormRules: {
        roleName: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      // console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败！");
      this.rolesList = res.data;
    },
    // 点击按钮提交添加角色请求
    addRoles() {
      // 预校验
      this.$refs.addRolesFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        if (res.meta.status !== 201)
          return this.$message.error("添加角色失败！");
        this.$message.success("添加角色成功！");
        this.getRolesList();
        this.addRolesDIalogVisible = false;
      });
    },
    // 添加角色对话框关闭监听
    closeRolesDialog() {
      this.$refs.addRolesFormRef.resetFields();
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`);
      if (res.meta.status !== 200)
        return this.$message.error("获取角色信息失败！");
      this.editRolesForm = res.data;
      this.editRolesVisible = true;
    },
    // 点击确定提交编辑角色请求
    editRole() {
      // 预校验
      this.$refs.editRolesFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `roles/${this.editRolesForm.roleId}`,
          this.editRolesForm
        );
        if (res.meta.status !== 200)
          return this.$message.error("修改角色信息失败！");
        this.$message.success("修改角色信息成功！");
        this.getRolesList();
        this.editRolesVisible = false;
      });
    },
    // 删除角色
    async removeRole(id) {
      const deleteConfirm = await this.$confirm(
        "此操作将永久删除该用户，是否继续？",
        "删除权限",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (deleteConfirm != "confirm") return this.$message.error("取消删除！");
      const { data: res } = await this.$http.delete(`roles/${id}`);
      if (res.meta.status !== 200) return this.$message.error("删除用户失败！");
      this.$message.success("删除用户成功！");
      this.getRolesList();
    },
    // 根据 id 删除对应的权限
    async removeRightById(role, rightId) {
      // 弹窗提示用户是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限，是否继续？",
        "删除权限",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") return this.$message.info("取消删除！");
      const { data: res } = await this.$http.delete(
        "roles/" + role.id + "/rights/" + rightId
      );
      if (res.meta.status !== 200) return this.$message.error("删除权限失败！");
      this.$message.success("删除权限成功");
      role.children = res.data;
    },
    // 分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      // 获取所有权限数据（树形）
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200)
        return this.$message.error("获取权限列表失败！");
      // 获取权限数据并保存到 data 中
      this.rightList = res.data;
      // 获取三级节点 id
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    // 通过递归的形式，获取角色下所有三级权限的 id ，保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 当前node节点不包含 children 属性，证明是三级节点
      if (!node.children) return arr.push(node.id);
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 关闭分配权限对话框时清空 defKeys ，确保每个角色的权限被正确勾选
    closeRightDialog() {
      this.defKeys = [];
    },
    // 点击确定为角色分配权限
    async allotRights() {
      const keys = [
        // 使用扩展运算符将获取到的已勾选节点的 id 传入 keys 中
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        "roles/" + this.roleId + "/rights",
        { rids: idStr }
      );
      if (res.meta.status !== 200)
        return this.$message.error("更改用户权限失败！");
      this.$message.success("修改权限成功!");
      this.getRolesList();
      this.setRightDialogVisible = false;
      // console.log(keys);
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

// 使下拉菜单中的权限垂直居中对齐
.vcenter {
  display: flex;
  align-items: center;
}
</style>
