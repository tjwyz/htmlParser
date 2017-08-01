import buble from 'rollup-plugin-buble';

export default {
  entry: 'src/index.js',
  moduleName: 'vtp',
  sourcemap: true,
  plugins: [
    buble({
      transforms: {
        dangerousForOf: true
      }
    })
  ],
  
  targets: [
    { dest: 'dist/vtp.js', format: 'umd' }
  ]
};
