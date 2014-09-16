var code_test = require('./code_test');

code_test.sanitizer(function(code) {
    return code.replace('say', 'said');
});

/*code_test.load(function() {
    code_test.run('hello', 'for(int i = 0; i < 5; i++) { cout << "I say " << i << endl; } int* test = NULL; cout << *test << endl;', process.stdout);
});*/

/*code_test.load(function() {
    code_test.run('hello', 'cout << "everything is working" << endl; cout << "get ready for a segfault" << endl; int * q = NULL; cout << *q << endl;', process.stdout, process.stderr);
});*/

var runningProgram = new code_test.RunningProgram();

runningProgram.on('err', function(type, info) {
    console.log('Our program had an error! Type: %s', type);
});

runningProgram.stdout = process.stdout;
runningProgram.stderr = process.stderr;

code_test.load(function() {
    code_test.run2('hello', 'cout << "what a wonderful piece of code!" << endl; cout << "here is a segfault" << endl; int* test = NULL; cout << *test << endl;', runningProgram);
});
