import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./admin/router";
import "./style.css";

document.documentElement.classList.add("light");

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount("#app");