#!/usr/bin/env node
var fs = require('fs');
var path = require('path');


var program = require('commander');
program
  .version('0.0.3','-v, --version')
  .option('-c, --compile', 'just compile it')
  .option('-d, --diff', 'get the difference from vueCompiler@2.4.0')
  .parse(process.argv);

var commander = program.parse(process.argv);
var tpl = commander.args[0];


var beautify = require('js-beautify').js_beautify
require('colors')
var jsdiff = require('diff');

var vtp =  require('../dist/vtp');
var vueCompiler = require('../test/base/vue@2.4.0-compiler');

if (program.compile) {
	fs.readFile(tpl, 'utf8', function (err, template) {
		if (err) {
			throw err;
		}
		var CodegenResult = vtp(template);
		CodegenResult.render = beautify(CodegenResult.render, { indent_size: 4 });
		console.log(CodegenResult.render);
	});
}

if (program.diff) {
	fs.readFile(path.join(__dirname,'../test/unit/' + tpl + '.tpl'), 'utf8', function (err, template) {
		if (err) {
			throw err;
		}
		// 实验组
		var CodegenResult = vtp(template);
		CodegenResult.render = beautify(CodegenResult.render, { indent_size: 4 });

		//对照组
		var vueResult = vueCompiler.compile(template);
		vueResult = beautify(vueResult.render, { indent_size: 4 });

		var diff = jsdiff.diffChars(vueResult, CodegenResult.render);

		diff.forEach(function(part){
			// green for additions, red for deletions
			// grey for common parts
			var color = part.added ? 'green' :
			part.removed ? 'red' : 'grey';
			process.stderr.write(part.value[color]);
		});
		console.log();
	});
}











