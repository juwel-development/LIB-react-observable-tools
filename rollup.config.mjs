import typescript from 'rollup-plugin-typescript2'

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
  plugins: [typescript({clean: true, tsconfigOverride: {compilerOptions: {declaration: true}}})]
}
