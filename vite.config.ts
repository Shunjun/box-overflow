/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-24 22:53:06
 */

import process from 'node:process'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

const __dir = process.cwd()

export default defineConfig({
  build: {
    outDir: 'dist',
    minify: false,
    sourcemap: true,
    lib: {
      entry: '',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'cjs')
          return 'cjs/[name].cjs'
        return 'esm/[name].js'
      },
    },
    rollupOptions: {
      output: {
        preserveModules: true,
      },
    },
  },
  plugins: [
    externalizeDeps(),
    dts({
      outDir: `dist/esm`,
      entryRoot: resolve(__dir, 'src'),
      include: resolve(__dir, 'src'),
      // exclude: options.exclude,
      compilerOptions: {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
        module: 'ESNext',
        declarationMap: false,
      },
      beforeWriteFile: (filePath, content) => {
        content = content.replace(
          /^(im|ex)port\s[\w{}*\s,]+from\s['"]\.\/[^.'"]+(?=['"];?$)/gm,
          '$&.js',
        )

        return { filePath, content }
      },
    }),
    dts({
      outDir: `dist/cjs`,
      entryRoot: resolve(__dir, 'src'),
      include: resolve(__dir, 'src'),
      // exclude: options.exclude,
      compilerOptions: {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
        module: 'CommonJS',
        declarationMap: false,
      },
      beforeWriteFile: (filePath, content) => {
        content = content.replace(
          /^(im|ex)port\s[\w{}*\s,]+from\s['"]\.\/[^.'"]+(?=['"];?$)/gm,
          '$&.cjs',
        )
        filePath = filePath.replace('.d.ts', '.d.cts')
        return { filePath, content }
      },
    }),
  ],
})
