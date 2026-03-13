import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
                    charts: ['lightweight-charts', 'recharts']
                }
            }
        }
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true
            }
        }
    }
})
