import { createApp } from 'vue';
import App from './App.vue';
import './global.css';
import { waitForStatData } from '../ready';

async function init() {
  await waitForStatData();
  createApp(App).mount('#app');
}

$(() => {
  errorCatched(init)();
});
