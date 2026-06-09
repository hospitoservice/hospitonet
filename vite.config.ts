import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/otp': {
            target: process.env.VITE_OTP_PROXY_TARGET || env.VITE_OTP_PROXY_TARGET || 'http://localhost:8095',
            changeOrigin: true,
            headers: { origin: 'http://localhost:3001' },
          },
          '/api/users': {
            target: process.env.VITE_USER_PROXY_TARGET || env.VITE_USER_PROXY_TARGET || 'http://localhost:8085',
            changeOrigin: true,
            headers: { origin: 'http://localhost:3001' },
          },
          '/patient': {
            target: process.env.VITE_PATIENT_PROXY_TARGET || env.VITE_PATIENT_PROXY_TARGET || 'http://localhost:8070',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/patient/, ''),
            headers: { origin: 'http://localhost:3001' },
          },
          '/appointment': {
            target: process.env.VITE_APPOINTMENT_PROXY_TARGET || env.VITE_APPOINTMENT_PROXY_TARGET || 'http://localhost:8080',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/appointment/, ''),
            headers: { origin: 'http://localhost:3001' },
          },
          // Employee service — MUST be registered before the broad /api catch-all.
          '/api/employees': {
            target: process.env.VITE_EMPLOYEE_PROXY_TARGET || env.VITE_EMPLOYEE_PROXY_TARGET || 'http://localhost:8082',
            changeOrigin: true,
            headers: { origin: 'http://localhost:3001' },
          },
          '/api': {
            target: process.env.VITE_HOSPITAL_PROXY_TARGET || env.VITE_HOSPITAL_PROXY_TARGET || process.env.VITE_HOSPITAL_SERVICE_URL || env.VITE_HOSPITAL_SERVICE_URL || 'http://localhost:8100',
            changeOrigin: true,
            headers: { origin: 'http://localhost:3001' },
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
