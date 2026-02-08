import { defineConfig } from 'vite'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    federation({
      name: 'host-app',
      remotes: {
        reactApp: 'http://localhost:5001/assets/remoteEntry.js',
        angularApp: {
          external: 'http://localhost:5002/remoteEntry.json',
          format: 'esm',
          from: 'vite'
        }
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 5000,
    strictPort: true
  },
  preview: {
    port: 5000,
    strictPort: true
  }
})
