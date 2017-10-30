'use strict';

// Require Dependencies
const gulp = require('gulp');
const fs = require('fs');
const gulpSequence = require('gulp-sequence');
const newer = require('gulp-newer');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const autoprefixer = require("autoprefixer");
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gcmq = require('gulp-group-css-media-queries');

// Project config
let projectConfig = require('./projectConfig.json');
let srcPath = projectConfig.path.src || './src/';
let distPath = projectConfig.path.dist || './build/';

// Settings
let postCssSettings = [
  autoprefixer({browsers: ['last 2 version']})
];

// Tasks

// Style
gulp.task('style', function() {
 return gulp.src(srcPath + 'sass/main.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss(postCssSettings))
  .pipe(sourcemaps.write('/'))
  .pipe(gulp.dest(distPath + 'styles'))
  .pipe(browserSync.stream({match: '**/*.css'}));
});


// Style build
gulp.task('style-build', function() {
 return gulp.src(srcPath + 'sass/main.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gcmq())
  .pipe(postcss(postCssSettings))
  .pipe(gulp.dest(distPath + 'styles'));
});


// Copy files
gulp.task('copy:scripts', function() {
  return gulp.src(srcPath + 'scripts/*.{js,json}')
    .pipe(newer(distPath + 'scripts'))
    .pipe(gulp.dest(distPath + 'scripts'));
});

gulp.task('copy:images', function() {
  return gulp.src(srcPath + 'images/**/*.{jpg,jpeg,png,gif,svg}')
    .pipe(newer(distPath + 'images'))
    .pipe(gulp.dest(distPath + 'images'));
});

gulp.task('copy:fonts', function() {
  return gulp.src(srcPath + 'fonts/**/*.{ttf,woff,woff2,eot,svg}')
    .pipe(newer(distPath + 'fonts'))
    .pipe(gulp.dest(distPath + 'fonts'));
});

gulp.task('copy:php', function() {
  return gulp.src(srcPath + '**/*.php')
    .pipe(newer(distPath))
    .pipe(gulp.dest(distPath));
});


// Concatenate scripts and styles
gulp.task('concat:scripts', function() {
  return gulp.src(projectConfig.assets.addJs)
    .pipe(concat('load-scripts.js'))
    .pipe(gulp.dest(distPath + 'scripts'));
});

gulp.task('concat:styles', function() {
  return gulp.src(projectConfig.assets.addCss)
    .pipe(concat('load-styles.css'))
    .pipe(gulp.dest(distPath + 'styles'));
});


// Minify styles and scripts
gulp.task('minify:css', function() {
  const cleanCSS = require('gulp-clean-css');
  return gulp.src(distPath + 'styles/*.css')
    .pipe(cleanCSS())
    .pipe(rename(function (path) {
      path.extname = '.min.css'
    }))
    .pipe(gulp.dest(distPath + 'styles'));
});

gulp.task('minify:scripts', function() {
  const uglify = require('gulp-uglify');
  return gulp.src(distPath + 'scripts/*.js')
    .pipe(plumber({
      errorHandler: function(err) {
        notify.onError({
          title: 'Javascript uglify error',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(uglify({
      mangle: false
    }))
    .pipe(rename(function (path) {
      path.extname = '.min.js'
    }))
    .pipe(gulp.dest(distPath + 'scripts'));
});


// optimize images
gulp.task('optimize-images', function() {
  const imagemin = require('gulp-imagemin');
  return gulp.src(distPath + 'images/**/*.{jpg,jpeg,gif,png,svg}')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest(distPath + 'images'));
});


// Sprite
gulp.task('create-sprite', function() {
  const spritesmith = require('gulp.spritesmith');
  const merge = require('merge-stream');
  let spriteData = gulp.src(srcPath + 'images/sprite/*.png').pipe(spritesmith({
    imgName: 'spritesheet.png',
    cssName: '_sprite.scss',
    padding: 2,
    cssFormat: 'css',
    imgPath: '../images/spritesheet.png'
  }));
  let imgStream = spriteData.img
    .pipe(gulp.dest(srcPath + 'images/'));
  let cssStream = spriteData.css
    .pipe(gulp.dest(srcPath + 'sass/'));
  return merge(imgStream, cssStream);
});


// Include HTML
gulp.task('html', function() {
  const fileinclude = require('gulp-file-include');
  return gulp.src(srcPath + '*.html')
    .pipe(plumber({
      errorHandler: function(err) {
        notify.onError({
          title: 'HTML compilation error',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(gulp.dest(distPath));
});


// Clean build folder
gulp.task('clean', function() {
  const del = require('del');
  return del([
    distPath + '*.html',
    distPath + 'fonts',
    distPath + 'images',
    distPath + 'scripts',
    distPath + 'styles'
  ]);
});


// Replace path

gulp.task('replace-path', function() {
  const replace = require('gulp-replace');
  gulp.src([distPath + '*.html'])
    .pipe(replace('load-styles.css', 'load-styles.min.css'))
    .pipe(replace('main.css', 'main.min.css'))
    .pipe(replace('load-scripts.js', 'load-scripts.min.js'))
    .pipe(replace('main.js', 'main.min.js'))
    .pipe(gulp.dest(distPath));
});

// Main tasks


// Build
gulp.task('build-dev', function(callback) {
  gulpSequence(
    'clean',
    ['style', 'copy:scripts', 'copy:images', 'copy:fonts', 'copy:php', 'concat:scripts', 'concat:styles'],
    'html',
    callback
  );
});

gulp.task('build', function(callback) {
  gulpSequence(
    'clean',
    ['style-build', 'copy:scripts', 'copy:images', 'copy:fonts', 'copy:php', 'concat:scripts', 'concat:styles'],
    ['minify:css', 'minify:scripts', 'optimize-images'],
    'html',
    'replace-path',
    callback
  );
});

// Sprite
gulp.task('sprite', function(callback) {
  gulpSequence(
    'create-sprite',
    'copy:images',
    callback
  );
});

// Watch
gulp.task('serve', ['build-dev'], function() {
  browserSync.init({
    server: distPath,
    startPath: '/',
    open: false,
    port: 5050,
  });
  gulp.watch('sass/**/*.scss', {cwd: srcPath}, ['style']);
  gulp.watch('scripts/*.{js,json}', {cwd: srcPath}, ['watch:scripts']);
  gulp.watch('images/**/*.{jpg,jpeg,gif,png,svg}', {cwd: srcPath}, ['watch:images']);
  gulp.watch('fonts/**/*.{ttf,woff,woff2,eot,svg}', {cwd: srcPath}, ['watch:fonts']);
  gulp.watch('**/*.php', {cwd: srcPath}, ['watch:php']);
  gulp.watch([
    '*.html',
    '_include/**/*.html'
  ], {cwd: srcPath}, ['watch:html']);
});

gulp.task('watch:scripts', ['copy:scripts'], reload);
gulp.task('watch:images', ['copy:images'], reload);
gulp.task('watch:fonts', ['copy:fonts'], reload);
gulp.task('watch:php', ['copy:php'], reload);
gulp.task('watch:html', ['html'], reload);


// Development task
gulp.task('default', ['serve']);


// Browser reload
function reload(done) {
  browserSync.reload();
  done();
}
