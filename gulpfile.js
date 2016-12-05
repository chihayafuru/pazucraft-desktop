var gulp = require("gulp");
var del = require("del");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var paths = {
    pages: ['src/*.html']
};

gulp.task("clean", function () {
    return del([
        'app/*'
    ]);
});

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("app"));
});

gulp.task("default", ["copy-html"], function () {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest("app"));
});
