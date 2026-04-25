/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'src/app/**', // Exclude Next.js app directory
    ],
    reporter: 'verbose',
    outputFile: {
      json: './coverage/test-results.json',
    },
    include: ['src/__tests__/**/*.test.ts'],
    testTimeout: 10000,
    bail: 0,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'next.config.ts',
        'eslint.config.mjs',
        'src/app/**', // Exclude Next.js app directory
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})