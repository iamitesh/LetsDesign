import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    angular(),
    federation({
      name: 'angularRemote',
      filename: 'remoteEntry.js',
      exposes: {
        './AngularWidget': './src/bootstrap.ts',
      },
      shared: [],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
    },
  },
  server: {
    port: 5002,
    strictPort: true,
  },
  preview: {
    port: 5002,
    strictPort: true,
  },
});
