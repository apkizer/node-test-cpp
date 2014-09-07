var child_process = require('child_process'),
	app = require('express')(),
	fs = require('fs'),
	templates = {};

var programs = 'programs';

fs.readdirSync(programs).forEach(function(file) {
	templates[file] = fs.readFileSync(programs + '/' + file);
});

app.get('/compile', function(req, res) {
	res.set({
		'Content-Type': 'text/plain'
	});
	var file = req.query.file,
		compiler = child_process.exec('g++ -x c++ -o compiled -', function(err, stdout, stderr) {
			if(err) return console.warn('[g++ execution error] %s', err);
			child_process.exec('./compiled').stdout.pipe(res);
		});
	compiler.stdin.end(templates[file]);
});

app.listen(3000);