# 电商后台管理 （vue + elementUI）

# 使用
## 安装依赖

```
yarn install
```

### 启动服务

```
yarn serve
```

### 项目打包

```
yarn build
```


# 页面详情

> 于 `main.js` 中导入必须的组件，如自定义的全局 css 样式、vue、element、以及 axios 。为 axios 赋予 `baseURL` 并将其挂载到 vue 原型对象中方便使用。
>
> elementUI 使用按需导入的方式， 在 `element.js` 中导入需要的组件，如 el-form、el-dialog 等组件。
>
> 配置 vue 路由守卫，以阻止未登录用户的其他页面请求，将其请求重定向至登录页。

## 登录页面

<img src="..\readmePic\login.png"  />

> 使用简单的样式处理绘制的页面， 搭配 el-form 组件完成。主要用到了 css 中的定位知识，以及边框阴影，边框圆角；less 的使用；axios 发送数据请求并接受解构赋值，将登录成功后返回的 token 存储至 浏览器的 sessionStorage 中，并根据 token 值，在 axios 拦截器中添加用户授权。

## 用户管理

![](..\readmePic\users.png)

> 将 axios 请求到的值解构赋值到 data 中，并通过 el-table 组件将其渲染到页面中，使用 el-table 中的 template  分别渲染开关按钮和点击按钮。
>
> 使用 axios 调用相应的 api 接口，将对用户的操作发送至服务器完成对用户列表的添加、删除或修改。发送成功后使用 elMessage 弹窗提醒。

## 角色列表

![](..\readmePic\roles.png)

> 与用户列表大致相同，但使用了 element 中的展开列和 tag 实现对权限的直观展示，并为 tag 添加点击事件从而完成对相应权限的删除。

## 权限列表

![](..\readmePic\power.png)

> 简单的 axios 请求数据，并由 el-table 展示。

## 商品列表

![](..\readmePic\goods.png)

## 分类参数

![](..\readmePic\params.png)

> 使用级联选择器，通过判断返回数组长度从而限制只能选择三级分类。使用 tabs 实现动态参数和静态属性的切换。
>
> 实现点按 New Tag 按钮添加参数。

## 商品分类

![](..\readmePic\cate.png)

> 使用 `vue-table-with-tree-grid` 组件实现页面的树形展示。

## 订单列表

![](..\readmePic\order.png)

## 数据报表

![](..\readmePic\report.png)

> 使用 echarts 将返回的报表数据渲染在页面上

