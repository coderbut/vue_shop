import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login.vue";
import Home from "../components/Home";
import Welcome from "../components/Welcome.vue";
import Users from "../components/user/Users";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    component: Login
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
        component: Welcome
      },
      {
        path: "/users",
        component: Users
      }
    ]
  }
];

const router = new VueRouter({
  routes
});
// 导航守卫，不允许用户直接访问/home
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});

export default router;
