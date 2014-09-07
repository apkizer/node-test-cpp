// cpp-node request format
{
	template: "test",
	code: ""
}

// cpp-node response format
{
	errors: [{
		type: 'parse',
		message: ''
	}, {
		type: 'run',
		message: ''
	}
	],
	out: ['line1', 'line2'],
	out: {}
}

// animation format. very direct API
[{
	method: 'mark',
	args: ['sid3']
}, {
	method: 'setNext',
	args: ['sid3', 'null']
}]