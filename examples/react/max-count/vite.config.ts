/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 18:44:05
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [react(), UnoCSS()],
})
