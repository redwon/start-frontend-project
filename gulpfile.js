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
const gcmq = require('gulp-group-css-media-queries');

// Settings
let postCssSettings = [
  autoprefixer({browsers: ['last 2 version']})
];

// Tasks

// Style
gulp.task('style', function() {
 return gulp.src('./src/sass/main.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss(postCssSettings))
  .pipe(sourcemaps.write('/'))
  .pipe(gulp.dest('./build/styles'))
  .pipe(browserSync.stream({match: '**/*.css'}));
});


// Style build
gulp.task('style-build', function() {
 return gulp.src('./src/sass/main.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gcmq())
  .pipe(postcss(postCssSettings))
  .pipe(gulp.dest('./build/styles'));
});


// Copy files
gulp.task('copy:scripts', function() {
  return gulp.src('./src/scripts/*.{js,json}')
    .pipe(newer('./build/scripts'))
    .pipe(gulp.dest('./build/scripts'));
});

gulp.task('copy:images', function() {
  return gulp.src('./src/images/**/*.{jpg,jpeg,png,gif,svg}')
    .pipe(newer('./build/images'))
    .pipe(gulp.dest('./build/images'));
});

gulp.task('copy:fonts', function() {
  return gulp.src('./src/fonts/**/*.{ttf,woff,woff2,eot,svg}')
    .pipe(newer('./build/fonts'))
    .pipe(gulp.dest('./build/fonts'));
});

gulp.task('copy:php', function() {
  return gulp.src('./src/**/*.php')
    .pipe(newer('./build'))
    .pipe(gulp.dest('./build'));
});


// Concatenate scripts and styles
gulp.task('concat:scripts', function() {
  return gulp.src('./src/_load-scripts/*.js')
    .pipe(concat('load-scripts.js'))
    .pipe(gulp.dest('./build/scripts'));
});

gulp.task('concat:styles', function() {
  return gulp.src('./src/_load-styles/*.css')
    .pipe(concat('load-styles.css'))
    .pipe(gulp.dest('./build/styles'));
});


// Minify styles and scripts
gulp.task('minify:css', function() {
  const cleanCSS = require('gulp-clean-css');
  return gulp.src('./build/styles/*.css')
    .pipe(cleanCSS())
    .pipe(rename(function (path) {
      path.extname = '.min.css'
    }))
    .pipe(gulp.dest('./build/styles'));
});

gulp.task('minify:scripts', function() {
  const uglify = require('gulp-uglify');
  return gulp.src('./build/scripts/*.js')
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
    .pipe(gulp.dest('./build/scripts'));
});


// optimize images
gulp.task('optimize-images', function() {
  const imagemin = require('gulp-imagemin');
  return gulp.src('./build/images/**/*.{jpg,jpeg,gif,png,svg}')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('./build/images'));
});


// Sprite
gulp.task('create-sprite', function() {
  const spritesmith = require('gulp.spritesmith');
  const merge = require('merge-stream');
  let spriteData = gulp.src('./src/images/sprite/*.png').pipe(spritesmith({
    imgName: 'spritesheet.png',
    cssName: '_sprite.scss',
    padding: 2,
    cssFormat: 'css',
    imgPath: '../images/spritesheet.png'
  }));
  let imgStream = spriteData.img
    .pipe(gulp.dest('./src/images/'));
  let cssStream = spriteData.css
    .pipe(gulp.dest('./src/sass/'));
  return merge(imgStream, cssStream);
});


// Include HTML
gulp.task('html', function() {
  const fileinclude = require('gulp-file-include');
  return gulp.src('./src/*.html')
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
    .pipe(gulp.dest('./build'));
});


// Clean build folder
gulp.task('clean', function() {
  const del = require('del');
  return del([
    './build/*.html',
    './build/fonts',
    './build/images',
    './build/scripts',
    './build/styles'
  ]);
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
    server: './build/',
    startPath: '/',
    open: false,
    port: 5050,
  });
  gulp.watch('src/sass/**/*.scss', {cwd: './'}, ['style']);
  gulp.watch('src/scripts/*.{js,json}', {cwd: './'}, ['watch:scripts']);
  gulp.watch('src/images/**/*.{jpg,jpeg,gif,png,svg}', {cwd: './'}, ['watch:images']);
  gulp.watch('src/fonts/**/*.{ttf,woff,woff2,eot,svg}', {cwd: './'}, ['watch:fonts']);
  gulp.watch('src/**/*.php', {cwd: './'}, ['watch:php']);
  gulp.watch('src/_load-scripts/*.js', {cwd: './'}, ['watch:concat-scripts']);
  gulp.watch('src/_load-styles/*.css', {cwd: './'}, ['watch:concat-styles']);
  gulp.watch([
    'src/*.html',
    'src/_include/**/*.html'
  ], {cwd: './'}, ['watch:html']);
});

gulp.task('watch:scripts', ['copy:scripts'], reload);
gulp.task('watch:images', ['copy:images'], reload);
gulp.task('watch:fonts', ['copy:fonts'], reload);
gulp.task('watch:php', ['copy:php'], reload);
gulp.task('watch:concat-scripts', ['concat:scripts'], reload);
gulp.task('watch:concat-styles', ['concat:styles'], reload);
gulp.task('watch:html', ['html'], reload);


// Development task
gulp.task('default', ['serve']);


// Browser reload
function reload(done) {
  browserSync.reload();
  done();
}
