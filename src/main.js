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
// 导入富文本编辑器
import VueQuillEditor from "vue-quill-editor";
// 富文本编辑器样式
import "quill/dist/quill.core.css"; // import styles
import "quill/dist/quill.snow.css"; // for snow theme
import "quill/dist/quill.bubble.css"; // for bubble theme

import * as echarts from 'echarts'

// 实现加载进度条
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// axios请求拦截器
axios.interceptors.request.use(config => {
  // 判断访问页面权限
  config.headers.Authorization = window.sessionStorage.getItem("token");
  // 必须return config
  return config;
});
// 在 request 拦截器中展示进度条
axios.interceptors.request.use(config => {
  Nprogress.start();
  return config;
});
// 在 response 拦截器中关闭进度条
axios.interceptors.response.use(config => {
  Nprogress.done();
  return config;
});

Vue.prototype.$http = axios;
Vue.prototype.$echarts = echarts;

Vue.config.productionTip = false;

Vue.component("tree-table", TreeTable);


// 全局注册
Vue.use(VueQuillEditor);

// 定义格式化时间的过滤器
Vue.filter("dateFormat", originVal => {
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0");
  const d = (dt.getDate() + "").padStart(2, "0");
  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");
  return `${y}-${m}-${d}  ${hh}:${mm}:${ss}`;
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
