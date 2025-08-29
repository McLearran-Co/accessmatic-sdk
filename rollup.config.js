import { terser } from '@rollup/plugin-terser';

export default {
  input: 'src/accessmatic.js',
  output: [
    {
      file: 'dist/accessmatic.js',
      format: 'iife',
      name: 'AccessMatic'
    },
    {
      file: 'dist/accessmatic.min.js',
      format: 'iife',
      name: 'AccessMatic',
      plugins: [terser()]
    }
  ],
  plugins: []
};
