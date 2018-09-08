const babel = require("gulp-babel");
const gulp = require("gulp");
const concat = require("gulp-concat");
const watch = require("gulp-watch");
const minimist = require('minimist');
const _ = require("lodash");
const minifyCSS = require("gulp-csso");
const uglify = require("gulp-uglify");
var htmlmin = require('gulp-htmlmin');


const vendors = {
  js: [
    "./node_modules/ansi-wrap/index.js",
    "./node_modules/array-each/index.js"
  ],
  css: ["./node_modules/**/*.css"]
};


const constants = {
  default: {
    jsfileName: "webModule.min.js",
    paths: {
      src: {
        html: "./sources/**/*.html",
        js: "./sources/*.js",
        css: "./sources/**/*.css",
        assets: "./sources/assets/**/*.*",
        config: "./sources/config/"
      },
      distrib: "./distrib"
    }
  },
  demo: {
    compact: false,
    minified: false,
    comments: false,
    paths: {
      distrib: "./docs/demo/modules/webModule/distrib/"
    }
  },
  release: {
    presets: ["es2017"],
    compact: true,
    minified: true,
    comments: false,
    plugins: ["minify-mangle-names"],
  },
  release2015: {
    presets: ["es2015"],
    compact: true,
    minified: true,
    comments: false,
    plugins: ["minify-mangle-names"],
    jsfileName: "webModule-es2015.min.js"
  }
};

var argv = minimist(process.argv.slice(2));
var constantsOpts = _.merge({}, constants.default, constants[argv.env]);


gulp.task("build:js", () => {
  console.log("env", constantsOpts);
  return gulp.src([
      constantsOpts.paths.src.js
    ])
    .pipe(concat(constantsOpts.jsfileName))
    .pipe(babel({
      presets: constantsOpts.presets,
      compact: constantsOpts.compact,
      minified: constantsOpts.minified,
      comments: constantsOpts.comments,
      plugins: constantsOpts.plugins
    }))
    .pipe(gulp.dest(constantsOpts.paths.distrib))
});

gulp.task("watch:js", function() {
  watch(constantsOpts.paths.src, function() {
    gulp.run("build:js");
    //  gulp.run("demo");
  });
});


gulp.task('build:html', function() {
  return gulp.src(constantsOpts.paths.src.html)
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(constantsOpts.paths.distrib));
});

gulp.task("watch:html", function() {
  watch(constantsOpts.paths.html, function() {
    gulp.run("build:html");
    //  gulp.run("demo");
  });
});


gulp.task("build:css", () => {
  return gulp.src([
      constantsOpts.paths.src.css
    ])
    .pipe(concat('style.min.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest(constantsOpts.paths.distrib));
});


gulp.task("watch:css", function() {
  watch(constantsOpts.paths.src, function() {
    gulp.run("build:css");
    //  gulp.run("demo");
  });
});

gulp.task("copy:assets", function() {
  return gulp.src(constantsOpts.paths.src.assets)
    .pipe(gulp.dest(constantsOpts.paths.distrib))
});

gulp.task('watch:assets', function() {
  watch(constantsOpts.paths.src.assets, function() {
    gulp.run('copy:assets');
  });
});

gulp.task("build:vendor:js", () => {
  return gulp.src(
      vendors.js
    )
    .pipe(concat('vendor.min.js'))
    .pipe(babel({
      presets: constantsOpts.presets,
      compact: true,
      minified: true,
      comments: false,
      plugins: constantsOpts.plugins
    }))
    .pipe(gulp.dest(constantsOpts.paths.distrib));
});

gulp.task("build:vendor:css", () => {
  return gulp.src(
      vendors.css
    )
    .pipe(concat('vendor.min.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest(constantsOpts.paths.distrib));
});


gulp.task('copy:config', function() {
  const configFile = constantsOpts.paths.src.config + "config-" + argv.env + ".js";
  return gulp.src(configFile)
    .pipe(concat("config.js"))
    .pipe(gulp.dest(constantsOpts.paths.distrib));
});

gulp.task("release", ["all"]);

gulp.task("default", ["build:js"]);

gulp.task("all", ["build:js", "build:html", "build:css", "build:vendor:js", "build:vendor:css", "copy:assets", "copy:config"]);

gulp.task("build:vendor", ["build:vendor:js", "build:vendor:css"]);

gulp.task("watch", ["watch:js", "watch:html", "watch:css", "watch:assets"]);