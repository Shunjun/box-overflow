/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 18:44:05
 */
import { defineConfig, mergeConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'

export default mergeConfig ({}, defineConfig({
  plugins: [react(), UnoCSS()],
  server: {},
}))
