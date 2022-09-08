import esbuild from 'esbuild'
// import { dtsPlugin } from 'esbuild-plugin-d.ts'
import { emptyDir, ensureDir } from 'fs-extra'
import glob from 'fast-glob'

const formats = ['iife', 'cjs', 'esm'] as const

const clear = async () => {
  await ensureDir('dist')
  await emptyDir('dist')
}
const doBuild = async (format: 'iife' | 'cjs' | 'esm') => {
  const isIIFE = format === 'iife'
  await esbuild.build({
    bundle: isIIFE,
    sourcemap: isIIFE || 'both',
    entryPoints: isIIFE ? ['src/index.ts'] : await glob('./src/*.ts', { cwd: process.cwd(), absolute: false }),
    outdir: `dist/${format}`,
    format: format,
    // plugins: !isIIFE ? [dtsPlugin()] : [],
  })
}
const build = async () => {
  await clear()
  await Promise.all(formats.map((format) => doBuild(format)))
}

build()
