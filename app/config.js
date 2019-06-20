
 
var gulp = require('gulp'),
    connect = require('gulp-connect-php');
    
gulp.task('connect-sync', function(done) {
  console.log(`Invoking gulp-connect-php on PID: ${process.pid}.`);

  connect.server({});

  // https://nodejs.org/api/process.html#process_signal_events
  // NOTE:
  // SIGINT might also work, that is sent when you issue CTRL+C
  // However there is a chance Gulp reacts to it or hides it internally.
  process.once('SIGUSR2', function() {
    console.log("Got SIGUSR2, invoking callback.");
    connect.closeServer();
    done();
  });
});

gulp.task('default', gulp.series('connect-sync'));
 

var fs = require('fs');
var app = require('electron').remote;
var dialog = app.dialog;
const path = require('path');
const ipcRenderer = require('electron').ipcRenderer;
const dirTree = require("directory-tree");
const { shell } = require('electron')
var chokidar = require('chokidar');



var editor = "";
var starterhtml = "";
var dragDrop = require('drag-drop')

var Datastore = require('nedb')
  	db = {};
	db.tree = new Datastore();
	db.tree_remote = new Datastore();
    db.projects = new Datastore({ filename: 'data/projects', autoload: true });

    window.addEventListener("error", function (e) {
   alert("Error occurred: " + e.error.message);
    console.log('Unhandled Rejection at:', reason.stack || reason)
   return false;
})
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  return false;
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})