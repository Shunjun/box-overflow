/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 18:44:05
 */
import { resolve } from 'node:path'
import { defineConfig, mergeConfig } from 'vite'

// import react from '@vitejs/plugin-react'
import commonConfig from '../../vite.config'

export default mergeConfig(commonConfig, defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: resolve(__dirname, 'src'),
      name: 'index',
    },
    cssCodeSplit: false,
  },
}))
