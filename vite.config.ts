import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/AdoraPlus/' : '/',
  plugins: [react()],
  server: { host: true, port: 5173, strictPort: false },
  preview: { host: '127.0.0.1', port: 4173 },
}));
