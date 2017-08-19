#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
const ejs = require('ejs');
var chokidar = require('chokidar');
var vueCompiler = require('../test/base/vue@2.4.0-compiler');
var program = require('commander');
var beautify = require('js-beautify').js_beautify
const uuidV1 = require('uuid/v1');

// program
//   .version('0.0.3','-v, --version')
//   .option('-c, --compile', 'just compile it')
//   .option('-d, --diff', 'get the difference from vueCompiler@2.4.0')
//   .option('-o, --output', 'vue-loader now')
//   .parse(process.argv);

var commander = program.parse(process.argv);



var configFilePath = commander.args[0] || 'vtp.config.js';
configFilePath = path.normalize(process.cwd() + '/' + configFilePath);
var cwdPath = path.dirname(configFilePath);
var config = require(configFilePath);
var workSrcDirectroy = path.normalize(cwdPath + '/' + config.src);
var outPutDirectroy = path.normalize(cwdPath + '/' + config.output);
// console.log(workSrcDirectroy);


var compiling = false;
// One-liner for current directory, ignores .dotfiles
chokidar.watch(workSrcDirectroy, {ignored: /(^|[\/\\])\../}).on('change', (event, path) => {
	// console.log(event, path);
	!compiling && compile(path,workSrcDirectroy);
});



//默认就一个template
const templateRegular = /<template>([\s\S]*)<\/template>/;
//可以有多个config
const configRegular = /<script(?:\s*)type(?:\s*)=(?:\s*)(?:"|')config(?:"|')(?:\s*)>([^<]*)<\/script>/g;
//多个script
const scriptRegular = /<script>([^<]*)<\/script>/g;
//多个style
const styleRegular = /<style(?:\s*)((?:scoped)?)(?:\s*)>([^<]*)<\/style>/g;



function compile(nowDealpath,workSrcDirectroy) {
	compiling = true;
	var arr = fs.readdirSync(workSrcDirectroy),
		itemFile;

	while ( itemFile = arr.pop() ){
		// console.log(workSrcDirectroy);
		var itemFilePath = path.normalize(workSrcDirectroy + '/' + itemFile);
		// console.log(itemFilePath);
		compileItem(itemFilePath,function(){
			console.log("nice");
		});
	}

	compiling = false;
}

function compileItem(filePath,cb){
	console.log(filePath);
	var templateStr = fs.readFileSync(filePath, {encoding:'utf8'});

	var template = style = script = config = '';

	var temp = '';

	if(templateRegular.exec(templateStr)){
		template = templateRegular.exec(templateStr)[0];
	}

	while(temp = scriptRegular.exec(templateStr)){
		script = script + '\n' + temp[1];
	}

	while(temp = configRegular.exec(templateStr)){
		config = config + '\n' + temp[1];
	}

	while(temp = styleRegular.exec(templateStr)){
		style = style + '\n' + temp[2];
	}
	var obj = {};

	obj.render = beautify(vueCompiler.compile(template).render, { indent_size: 4 });
	obj.staticRenderFns = beautify(vueCompiler.compile(template).staticRenderFns, { indent_size: 4 });
	obj.script = script;
	obj.config = config;

	//先不考虑嵌套的情况了...
	obj.moduleName = path.basename(filePath,'.tpl');

	obj.scopeId = uuidV1();
	// console.log(obj);
	var loaderTpl = fs.readFileSync(path.join(__dirname, './template.tpl'), {encoding:'utf8'}); 
	var ret = ejs.render(loaderTpl, obj); 
	console.log(ret);

}

// var loaderTpl = fs.readFileSync(path.join(__dirname, '../loader/template.tpl'), {encoding:'utf8'}); 


// var ret = ejs.render(loaderTpl, obj); 
// console.log(ret);