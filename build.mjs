import esbuild from 'esbuild';

esbuild.buildSync({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.mjs',
    format: 'esm',
    target: 'node16',
    platform: 'node',
    bundle: true
});