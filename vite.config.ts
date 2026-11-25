import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Ubah konstanta ini agar sesuai dengan nama repository GitHub Pages kamu.
export const REPO_NAME = '3-years';

export default defineConfig({
  plugins: [react()],
  base: '/' + REPO_NAME + '/',
});
