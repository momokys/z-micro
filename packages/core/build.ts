import esbuild from 'esbuild'
import { emptyDir, ensureDir } from 'fs-extra'

const entry = 'index.ts'
const outfileName = 'index'
const formats = ['iife', 'cjs', 'esm'] as const

const clear = async () => {
  await ensureDir('dist')
  await emptyDir('dist')
}
const doBuild = async (format: 'iife' | 'cjs' | 'esm') => {
  await esbuild.build({
    bundle: true,
    sourcemap: 'both',

    entryPoints: [entry],
    outfile: `dist/${outfileName}.${format}.js`,
    format: format,
  })
}
const build = async () => {
  await clear()
  await Promise.all(formats.map((format) => doBuild(format)))
}

build()
