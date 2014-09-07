var child_process = require('child_process'),
	exec = child_process.exec,
	sanitizers = [];

exports.sanitizer = function(fn) {
	sanitizers.push(fn);
};

exports.run = function(template, code, fn) {

};

function templatize(template, code, fn) {

}