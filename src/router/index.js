import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home";
import Welcome from "../components/Welcome.vue";
import Users from "../components/user/Users";
import Rights from "../components/power/Rights";
import Roles from "../components/power/Roles";
import Categories from "../components/goods/Categories";
import Params from "../components/goods/Params";
import GoodsList from "../components/goods/List";
import Add from "../components/goods/Add.vue";
import Order from "../components/order/Order";
import Report from "@/components/report/Report";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/home",
    component: Home,
    // 重定向到welcome页面
    redirect: "/welcome",
    // 子路由
    children: [
      {
        path: "/welcome",
        component: Welcome,
      },
      {
        path: "/users",
        component: Users,
      },
      // 权限管理页面
      {
        path: "/rights",
        component: Rights,
      },
      {
        path: "/roles",
        component: Roles,
      },
      // 商品分类页面
      {
        path: "/categories",
        component: Categories,
      },
      {
        path: "/params",
        component: Params,
      },
      {
        path: "/goods",
        component: GoodsList,
      },
      {
        path: "/goods/add",
        component: Add,
      },
      {
        path: "/orders",
        component: Order,
      },
      {
        path: "/reports",
        component: Report,
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});
// 导航守卫，不允许用户直接访问/home
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});

export default router;
