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
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 为第一行添加上边框线，以及为每一行添加下边框线 -->
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
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
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
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
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="editRole"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRole"
              >删除</el-button
            >
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="closeRightDialog"
    >
      <!-- 树形权限列表 -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
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
        children: "children"
      },
      // 默认选中的节点的 id 值
      defKeys: [],
      // 当前即将分配权限的 id
      roleId: ""
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
    // 编辑角色
    editRole() {},
    // 删除角色
    removeRole() {},
    // 根据 id 删除对应的权限
    async removeRightById(role, rightId) {
      // 弹窗提示用户是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限，是否继续？",
        "删除权限",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
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
      node.children.forEach(item => {
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
        ...this.$refs.treeRef.getHalfCheckedKeys()
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
    }
  }
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
