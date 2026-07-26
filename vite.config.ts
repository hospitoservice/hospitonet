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
          // Insurance plan catalog also lives on user-service — MUST be registered before the broad /api catch-all.
          '/api/insurance-plans': {
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
          // Named "/appointment-graphql" (not "/appointment") so it doesn't collide
          // with the client-side route "/appointment/:id" — a hard navigation or
          // refresh on that route used to be swallowed by this proxy rule instead
          // of being served by the SPA, producing a 404 from appointment-service.
          '/appointment-graphql': {
            target: process.env.VITE_APPOINTMENT_PROXY_TARGET || env.VITE_APPOINTMENT_PROXY_TARGET || 'http://localhost:8080',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/appointment-graphql/, '/graphql'),
            headers: { origin: 'http://localhost:3001' },
          },
          // Employee service — MUST be registered before the broad /api catch-all.
          '/api/employees': {
            target: process.env.VITE_EMPLOYEE_PROXY_TARGET || env.VITE_EMPLOYEE_PROXY_TARGET || 'http://localhost:8082',
            changeOrigin: true,
            headers: { origin: 'http://localhost:3001' },
          },
          // Notifications live on otp-service — MUST be registered before the broad /api catch-all.
          '/api/notifications': {
            target: process.env.VITE_OTP_PROXY_TARGET || env.VITE_OTP_PROXY_TARGET || 'http://localhost:8095',
            changeOrigin: true,
            headers: { origin: 'http://localhost:3001' },
          },
          // Orders live on their own service — MUST be registered before the broad /api catch-all.
          '/api/orders': {
            target: process.env.VITE_ORDER_PROXY_TARGET || env.VITE_ORDER_PROXY_TARGET || 'http://localhost:8096',
            changeOrigin: true,
            headers: { origin: 'http://localhost:3001' },
          },
          // Billing lives on hospital-service's /graphql endpoint — named distinctly
          // (not "/billing") so it doesn't collide with the broad /api catch-all below,
          // same reasoning as /appointment-graphql.
          '/billing-graphql': {
            target: process.env.VITE_HOSPITAL_PROXY_TARGET || env.VITE_HOSPITAL_PROXY_TARGET || 'http://localhost:8100',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/billing-graphql/, '/graphql'),
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
