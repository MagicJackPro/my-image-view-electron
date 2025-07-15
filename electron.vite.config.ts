import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin  } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [bytecodePlugin(),externalizeDepsPlugin()]
  },
  preload: {
    plugins: [,externalizeDepsPlugin()]
    // plugins: [bytecodePlugin(),externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
