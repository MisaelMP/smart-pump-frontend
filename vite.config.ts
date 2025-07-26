import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tsconfigPaths(), // Automatically reads from tsconfig.json
		tailwindcss(), // Tailwind CSS v4 Vite plugin
	],
	server: {
		port: 3000,
		open: true,
		cors: true,
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: 'dist',
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					router: ['react-router-dom'],
					forms: ['react-hook-form', '@hookform/resolvers'],
					ui: ['lucide-react', 'sonner', 'clsx'],
				},
			},
		},
	},
	preview: {
		port: 3000,
		open: true,
	},
});
