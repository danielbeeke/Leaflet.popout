/*
Leaflet.popout building and linting scripts.

To use, install Node, then run the following commands in the project root:

    npm install -g jake
    npm install uglify-js
    npm install jshint

To check the code and build Leaflet.popout from source, run "jake"
*/

var build = require('./build/build.js');

desc('Check Leaflet.popout source for errors with JSHint');
task('lint', build.lint);

desc('Combine and compress Leaflet.popout source files');
task('build', ['lint'], build.build);

task('default', ['build']);
