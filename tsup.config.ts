import { defineConfig } from 'tsup';

export default defineConfig({
  dts: true,
  metafile: true,
  sourcemap: true,
  format: ['esm'],
  entry: ['src/index.ts'],
});
