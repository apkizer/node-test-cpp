var code_test = require('./code_test');

code_test.load(function() {
	code_test.run('hello', 'for(int i = 0; i < 5; i++) { cout << "I say " << i << endl; }', process.stdout);
});


