var child_process = require('child_process'),
    path = require('path'),
    fs = require('fs');

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

exports.run = function(template, code, out) {
    sanitizers.forEach(function(sanitizer){
        code = sanitizer.call(this, code) || code;
    });
    var _template = templates[template],
        source = _template.toString().replace(config.replace, code);
    compileAndRun(source, out);
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

function compileAndRun(source, out) {
    var compiler = child_process.exec('g++ -x c++ -o compiled -', function(err, stdout, stderr) {
            if(err) return console.warn('[g++ execution error] %s', err);
            child_process.exec('./compiled').stdout.pipe(out);
        });
    compiler.stdin.end(source);
}