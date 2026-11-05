import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': 'http://localhost:3000',
        '/ai': 'http://localhost:3000',
        '/auth': 'http://localhost:3000',
      },
    },
  }
})
