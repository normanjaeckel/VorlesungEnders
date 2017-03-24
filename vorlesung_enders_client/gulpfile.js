var gulp = require('gulp'),
    gulpJspm = require('gulp-jspm'),
    path = require('path');

var DEPLOYMENT_DIRECTORY_NAME = path.join('..', 'personal_data');

gulp.task('clientSrc', function () {
    return gulp.src('src/*')
    .pipe(gulp.dest(path.join(DEPLOYMENT_DIRECTORY_NAME, 'client', 'src')));
});

gulp.task('clientStatics', function () {
    return gulp.src([
        'index.html',
        'jspm_packages/system.js',
        'config.js',
    ])
    .pipe(gulp.dest(path.join(DEPLOYMENT_DIRECTORY_NAME, 'client')));
});

gulp.task('jspmBundle', function () {
    return gulp.src('src/main.js')
    .pipe(gulpJspm({fileName: 'build'}))
    .pipe(gulp.dest(path.join(DEPLOYMENT_DIRECTORY_NAME, 'client')));
});

gulp.task('default', [
    'clientSrc',
    'clientStatics',
    'jspmBundle',
], function () {});
