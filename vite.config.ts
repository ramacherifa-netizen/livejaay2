import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // In cloud environment behind HTTPS reverse proxy (Cloud Run / AI Studio),
      // client connects on port 443 (WSS). File watching respects DISABLE_HMR.
      hmr: process.env.DISABLE_HMR === 'true'
        ? false
        : {
            clientPort: 443,
          },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
