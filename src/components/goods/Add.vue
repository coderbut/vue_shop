<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        :closable="false"
        center
      ></el-alert>
      <!-- 步骤条 -->
      <!-- activeIndex - 0 将字符串转换为数字传 finish-status 中 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="商品信息" name="0">
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
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单 item 项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cb, i) in item.attr_vals"
                  :label="cb"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action: 图片要上传到服务器的后台 API 地址 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="PreviewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 导入 lodash
import _ from "lodash";

export default {
  data() {
    return {
      activeIndex: "0",
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        pics: [],
        attrs: []
      },
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur"
          }
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur"
          }
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur"
          }
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur"
          }
        ],
        goods_cat: [
          {
            required: true,
            message: "请选择商品分类",
            trigger: "blur"
          }
        ]
      },
      cateList: [],
      cateProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // upload 组件中的请求头对象
      // 为上传组件添加请求头确保上传成功, 在 upload 组件中并未使用 mainjs 中已定义的 axios 拦截器
      headersObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 图片预览
      previewPath: "",
      PreviewVisible: false,
      // 商品描述
      goods_introduce: ""
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败");
      }
      this.cateList = res.data;
    },
    // 级联选择器选中项变化触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    // 管理 tabs 的切换, 返回 false 则阻止标签页切换
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    async tabClicked() {
      // 证明访问的是动态参数面板
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many"
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品参数失败");
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
        // console.log(res.data);
      }
      // 访问静态属性面板
      if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only"
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取商品属性失败");
        }
        this.onlyTableData = res.data;
      }
    },
    // 图片预览事件
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.PreviewVisible = true;
    },
    // 监听图片上传成功
    handleSuccess(res) {
      const picInfo = {
        pic: res.data.tmp_path
      };
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 处理移除图片操作
    handleRemove(file) {
      /**
       * 获取将要删除的图片临时路径
       * 从 pics 数组中, 查询到这个图片对应的索引值
       * 使用 splice 方法, 将图片信息对象, 从 pics数组中移除
       */
      const filePath = file.response.data.tmp_path;
      const index = this.addForm.pics.findIndex(x => x.pic === filePath);
      this.addForm.pics.splice(index, 1);
      console.log(this.addForm);
    },
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error("请填写必要的表单项");
        // 级联选择器必须要绑定一个数组, 而上传参数的时候需要上传一个字符串, 所以在上传之前需要使用深拷贝复制一份与级联选择器互不干扰的对象进行操作
        const form = _.cloneDeep(this.addForm);
        // 处理分类参数, 将数组转换成字符串
        form.goods_cat = form.goods_cat.join(",");
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        // console.log(form.attrs);
        form.attrs = this.addForm.attrs;
        console.log(form);
        // 发起请求添加商品 商品的名称必须是唯一的
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201) {
          console.log(res);
          return this.$message.error(res.meta.msg);
        }
        this.$message.success("添加商品成功");
        this.$router.push("/goods");
      });
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
</style>
