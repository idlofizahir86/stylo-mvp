import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        // svgr options
        icon: true,
      },
      // Mendukung ?react suffix
      include: '**/*.svg?react',
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    exclude: [
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow/tfjs-core',
      '@tensorflow-models/pose-detection',
      '@mediapipe/pose'
    ]
  }
})