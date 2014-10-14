var gulp = require('gulp');
var $ = require('gulp-load-plugins')({lazy: false});
var source = require('vinyl-source-stream');
var browserify = require('browserify');

var argv = require('minimist')(process.argv.slice(2));

var paths = {
  scripts: {
    entry: './app/js/main.js',
    all: './app/**/*.js'
  },
  stylesheets: './app/sass/**/*.sass',
  dist: './dist'
};

gulp.task('lint', function() {
  return gulp.src(paths.scripts.all)
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
});

gulp.task('scripts', ['lint'], function() {
  return browserify(paths.scripts.entry)
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest(paths.dist))
    .pipe($.rename('main.min.js'))
    .pipe($.streamify( $.uglify() ))
    .pipe(gulp.dest(paths.dist))
});

gulp.task('sass', function () {
  return gulp.src(paths.stylesheets)
    .pipe($.rubySass())
    .pipe($.autoprefixer())
    .pipe(gulp.dest(paths.dist))
});

gulp.task('watch', function() {
  gulp.watch([paths.scripts.all], ['lint', 'scripts']);
  gulp.watch([paths.stylesheets], ['sass']);
});

gulp.task('deploy', function () {
  gulp.src(paths.dist + '/*.*')
    .pipe($.ghPages('https://github.com/rileyjshaw/tappy.git', 'origin'));
});

gulp.task('webserver', function() {
  gulp.src(paths.dist)
    .pipe($.webserver({
      host: '0.0.0.0',
      livereload: true,
      open: true
    }));
});

gulp.task( 'default', [ 'lint', 'scripts', 'sass', 'webserver', 'watch' ] );
