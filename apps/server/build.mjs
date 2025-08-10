import * as esbuild from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';

async function build() {
  // Clean dist directory
  await fs.rm('./dist', { recursive: true, force: true });
  await fs.mkdir('./dist', { recursive: true });

  await esbuild.build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile: './dist/main.js',
    packages: 'external',
    sourcemap: true,
    minify: false,
    logLevel: 'info',
  });

  console.log('Build completed!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});