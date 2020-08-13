import { dest, parallel, series, src, watch } from 'gulp'

import browserSync from 'browser-sync'
import htmlmin from 'gulp-htmlmin'
import postcss from 'gulp-postcss'
import normalize from 'postcss-normalize'
import presetEnv from 'postcss-preset-env'
import csso from 'postcss-csso'
import webpackStream from 'webpack-stream'
import imagemin from 'gulp-imagemin'

const path = {
  baseDir: './dist',
  src: {
    assets: './src/assets/*',
    html: './src/templates/*.html',
    css: './src/styles/*.css',
    js: './src/scripts/index.js',
    images: './src/images/*',
  },
  dist: {
    assets: './dist',
    html: './dist',
    css: './dist/css',
    js: './dist/js',
    images: './dist/images',
  },
}

const assets = () => src(path.src.assets).pipe(dest(path.dist.assets))

const html = () =>
  src(path.src.html)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(path.dist.html))

const css = () =>
  src(path.src.css)
    .pipe(postcss([normalize, presetEnv, csso]))
    .pipe(dest(path.dist.css))

const js = () =>
  src(path.src.js)
    .pipe(
      webpackStream({
        output: {
          filename: 'main.js',
        },
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /(node_modules)/,
              loader: 'babel-loader',
            },
          ],
        },
      }),
    )
    .pipe(dest(path.dist.js))

const images = () =>
  src(path.src.images).pipe(imagemin()).pipe(dest(path.dist.images))

const watchTask = cb => {
  browserSync.init({
    startPath: '/',
    server: path.baseDir,
    open: true,
  })
  watch(path.src.html, html)
  watch(path.src.css, css)
  watch(path.src.js, js)
  watch(path.src.images, images)
  watch('dist').on('change', browserSync.reload)
  cb()
}

export default series(parallel(assets, html, css, js, images), watchTask)
