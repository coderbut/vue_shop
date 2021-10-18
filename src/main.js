import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
import "./assets/css/global.css";
// 导入字体图标
import "./assets/fonts/iconfont.css";
// 导入axios
import axios from "axios";
import TreeTable from "vue-table-with-tree-grid";

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// axios请求拦截器
axios.interceptors.request.use(config => {
  // 判断访问页面权限
  config.headers.Authorization = window.sessionStorage.getItem("token");
  // 必须return config
  return config;
});

Vue.prototype.$http = axios;

Vue.config.productionTip = false;

Vue.component("tree-table", TreeTable);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
