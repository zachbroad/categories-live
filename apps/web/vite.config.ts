import sharedConfig from '@repo/vite-config';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig, mergeConfig } from 'vite';

export default defineConfig(configEnv =>
  mergeConfig(
    sharedConfig({
      env: configEnv,
      lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      testSetupFiles: './src/setupTest.ts'
    }),
    defineConfig({
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src')
        }
      }
    }),
    false
  )
);
