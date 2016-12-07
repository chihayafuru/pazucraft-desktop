var gulp = require("gulp");
var del = require("del");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var paths = {
    pages: ['src/*.html'],
    icons: ['src/*.gif']
};

gulp.task("clean", function () {
    return del([
        'app/*'
    ]);
});

gulp.task("copy-icon", function() {
    return gulp.src(paths.icons)
        .pipe(gulp.dest("app"));
})

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("app"));
});

gulp.task("default", ["copy-html","copy-icon"], function () {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest("app"));
});
