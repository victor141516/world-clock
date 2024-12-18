import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

new Promise<void>(async (res) => {
  if (typeof window.Temporal === 'undefined') {
    await import('temporal-polyfill/global')
  }
  res()
}).then(() => {
  createApp(App).mount('#app')
})
