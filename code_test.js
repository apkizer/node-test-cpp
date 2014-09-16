var child_process = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    stream = require('stream'),
    util = require('util');


var config = {
        programs: 'programs',
        replace: '#define USER_DATA'
    },
    templates = {},
    sanitizers = [];

exports.config = function(_config) {
    for(var property in _config) {
        if(typeof _config[property] !== 'undefined') {
            config[property] = _config[property];
        }
    }
};

exports.sanitizer = function(fn) {
    sanitizers.push(fn);
};

exports.load = function(templateName, templateFile, fn) {
    if(typeof templateName === 'string' && typeof templateFile === 'string') {
        loadTemplate(templateName, templateFile, fn);
    } else if(typeof templateName === 'string' && typeof templateFile === 'function') {
        loadTemplate(templateName, path.join(config.programs, templateName + '.cpp'), templateFile);
    } else {
        fs.readdir(config.programs, function(err, files) {
            if(err) return console.warn(err);
            files.forEach(function(file) {
                loadTemplate(file.split('.')[0], path.join(config.programs, file), templateName || function(){});
            });
        })
    }
};

exports.run = function(template, code, out, err) {
    sanitizers.forEach(function(sanitizer){
        code = sanitizer.call(this, code) || code;
    });
    var _template = templates[template],
        source = _template.toString().replace(config.replace, code);
    compileAndRun(source, out, err);
};

exports.run2 = function(template, code, runningProgram) {
    sanitizers.forEach(function(sanitizer) {
        code = sanitizer.call(this, code) || code;
    });
    var _template = templates[template],
        source = _template.toString().replace(config.replace, code);
    compileAndRun2(source, runningProgram);
};

function loadTemplate(templateName, templateFile, fn) {
    console.info('Loading template %s %s', templateName, templateFile);
    fs.readFile(templateFile, function(err, data) {
        if(err) return console.warn(err);
        templates[templateName] = data;
        if(fn)
            fn();
    });
}

function compileAndRun(source, outStream, errStream) {
    var compiler = child_process.exec('g++ -x c++ -o compiled -', function(err, stdout, stderr) {
            if(err) return console.warn('[g++ execution error] %s', err);
            var program = child_process.exec('./compiled');
            if(outStream) program.stdout.pipe(outStream);
            if(errStream) program.stderr.pipe(errStream);
            program.on('exit', function(code, signal) {
                console.log('program exited with code %s and signal %s', code, signal);
            });
        });
    compiler.stdin.end(source);
}

function compileAndRun2(source, runningProgram) {
    var compiler = child_process.exec('g++ -x c++ -o compiled -', function(err, stdout, stderr) {
                      if(err) return runningProgram.emit('err', 'execution error'); //TODO parse g++ error 
                      var program = child_process.exec('./compiled');
                      //runningProgram.stdout = program.stdout;
                      //runningProgram.stderr = program.stderr;
                      program.stdout.pipe(runningProgram.stdout);
                      program.stderr.pipe(runningProgram.stderr);
                      program.on('exit', function(code, signal) {
                         if(signal == 'SIGSEGV') {
                            runningProgram.emit('err', 'segfault', {});
                         }
                      });
                  });
        compiler.stdin.end(source);
}

// returns object with type and info
function parseGPlusPlusError(err) {
    //TODO 
};

function RunningProgram() {
    EventEmitter.call(this);
    this.stdout = null;
    this.stderr = null;
}
util.inherits(RunningProgram, EventEmitter);

/*
RunningProgram events
---------------------

'err', function(type, data) {};
'end', function(output) {};

*/

exports.RunningProgram = RunningProgram;
