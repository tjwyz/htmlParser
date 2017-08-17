#!/usr/bin/env node

var vtp =  require('../dist/vtp');
var fs = require('fs');
var path = require('path');
var beautify = require('js-beautify').js_beautify

var program = require('commander');
var commander = program.parse(process.argv);
var pathString = commander.args[0];

var pathExist = fs.existsSync(pathString);


if (pathExist) {

	fs.readFile(pathString, 'utf8', function (err, template) {
	    if (err) {
	        throw err;
	    }

	    var CodegenResult = vtp(template);
	    CodegenResult.render = beautify(CodegenResult.render, { indent_size: 4 });
	    console.log(CodegenResult.render);
	});

} else {
	throw new Error("file not found");
}