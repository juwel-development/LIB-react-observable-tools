import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json' with { type: "json" };

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,

    },
  ],
  external: ['react', 'rxjs', 'tsyringe', 'reflect-metadata'],
  plugins: [typescript({clean: true, tsconfigOverride: {compilerOptions: {declaration: true}}})]
}