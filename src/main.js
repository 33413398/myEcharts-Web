import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import axios from "axios";
import * as echarts from "echarts";
import "./assets/lib/theme/chalk";
import "./assets/lib/theme/westeros";
import "./assets/lib/theme/vintage";
// 引入字体文件
import "./assets/font/iconfont.css";
// 引入 socket_service
import SocketService from "./utils/socket_service";
// 对服务端进行 webSocket的连接
// SocketService.Instance.connect();

Vue.prototype.$socket = SocketService.Instance;
Vue.prototype.$axios = axios;
Vue.prototype.$echarts = echarts;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
