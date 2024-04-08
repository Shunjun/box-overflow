import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCss from 'unocss/vite'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCss(), externalizeDeps({
    deps: true,
    devDeps: false,
    except: ['vue'],
    nodeBuiltins: true,
    optionalDeps: true,
    peerDeps: true,
  })],
  build: {
    minify: false,
    rollupOptions: {
      external: ['vue', '@faker-js/faker', 'vue-box-overflow'],
    },
  },
})
