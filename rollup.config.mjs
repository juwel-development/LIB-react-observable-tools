import esbuild from 'rollup-plugin-esbuild'

export default {
  input: {
    index: 'src/index.ts',
    hooks: 'src/hooks/index.ts',
    event: 'src/Event/index.ts',
  },
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      exports: 'named',
      entryFileNames: '[name].js',
      sourcemap: true
    },
    {
      dir: 'dist/es',
      format: 'es',
      entryFileNames: '[name].js',
      sourcemap: true,
    },
  ],
  external: ['react', 'rxjs', 'tsyringe', 'reflect-metadata'],
  // TypeScript 7's Go-native compiler dropped the programmatic compiler API that
  // rollup-plugin-typescript2 relied on, so transpilation runs through esbuild here
  // instead (it has its own TS/JSX parser); declarations are emitted separately by
  // `tsc` itself, which is unaffected since the CLI still works as before.
  plugins: [esbuild({ tsconfig: 'tsconfig.json', target: 'es6' })]
}
