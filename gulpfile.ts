import tslint from 'gulp-tslint';

import * as run from 'run-sequence';
import * as del from 'del';
import * as gulp from 'gulp';
import * as babel from 'gulp-babel';
import * as merge from 'merge2';
import * as replace from 'gulp-replace';
import * as reexport from 'gulp-reexport';
import * as sourcemaps from 'gulp-sourcemaps';
import * as typescript from 'gulp-typescript';
import * as childProcess from 'child_process';

let reexportPathResolver = file => { return file.relative.startsWith('.') ? file.relative : `./${file.relative}` };

gulp.task('lint', () =>
    gulp.src(['src/**/*.ts', 'test/**/*.ts'])
        .pipe(tslint({
            formatter: 'stylish'
        }))
        .pipe(tslint.report())
);

gulp.task('clean-coverage', () => {
  return del(['coverage', '.nyc_output']);
});

gulp.task('clean-compiled', () => {
  return del(['compiled']);
});

gulp.task('clean-index', () => {
  return del(['src/index.ts']);
});

gulp.task('clean-lib', () => {
  return del(['lib', 'src/index.ts']);
});

gulp.task('clean', done => {
  return run('clean-coverage', 'clean-compiled', 'clean-lib', done);
});

gulp.task('copy-datasets', done => {
  return gulp.src('test/datasets/**/*.*').pipe(gulp.dest('compiled/test/datasets'))
});

let tsProject = typescript.createProject('tsconfig.json');
gulp.task('compile', () => {
    return merge([
        tsProject.src() 
            .pipe(sourcemaps.init())
            .pipe(tsProject())
            .pipe(sourcemaps.write('.', undefined))
            .pipe(gulp.dest('compiled')),
        gulp.src('test/datasets')
            .pipe(gulp.dest('compiled/test/datasets'))
    ]);  
});

let tsLibProject = typescript.createProject('tsconfig.json', { declaration: true, sourceMap: false });
gulp.task('compile-lib', () => {
    let tsResult = gulp.src(['src/**/!(main.*)']) 
        .pipe(tsLibProject());

    return merge([
        tsResult.js
            .pipe(babel({ presets: ['es2016']}))
            .pipe(gulp.dest('lib')),
        tsResult.dts
            .pipe(gulp.dest('lib'))
            .pipe(reexport.default('index.d.ts', { pathResolver: reexportPathResolver }))
            .pipe(replace('"', `'`))
            .pipe(gulp.dest('lib'))
    ]);
});

gulp.task('reexport-source', () => {
    return gulp.src(['src/**/*.ts', '!src/main.ts'], { read: false }) 
        .pipe(reexport.default('index.ts', { pathResolver: reexportPathResolver }))
        .pipe(replace('"', `'`))
        .pipe(gulp.dest('src'));
});


gulp.task('reexport', done => {
	run('reexport-source', 'reexport-typings', done);
});


gulp.task('build', done => {
    run('lint', 'clean', 'reexport-source', 'compile-lib', 'clean-index', done);
});