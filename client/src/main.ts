import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import api from "@/services/api/index.js";
// This is actually used, ignore your syntax highlighting
import hljsVuePlugin from "@highlightjs/vue-plugin";

import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import "windi.css";

let app = createApp(App);
app.use(router);
app.use(hljsVuePlugin, {
  languages: {
    javascript,
    json
  }
});
app.config.globalProperties.api = api;
app.mount("#app");
