#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const ejs = require('ejs');
const vueCompiler = require('../test/base/vue@2.4.0-compiler');
const program = require('commander');
const beautify = require('js-beautify').js_beautify
const uuidV1 = require('uuid/v1');
const shell = require("shelljs");
const chalk = require('chalk');
const timestamp = require('time-stamp');
const log = console.log;
const UglifyJS = require("uglify-js");
const CleanCSS = require('clean-css');
const rread = require('readdir-recursive');
const rd = require('rd');
// program
//   .version('0.0.3','-v, --version')
//   .option('-c, --compile', 'just compile it')
//   .option('-d, --diff', 'get the difference from vueCompiler@2.4.0')
//   .option('-o, --output', 'vue-loader now')
//   .parse(process.argv);

const commander = program.parse(process.argv);



var configFilePath = commander.args[0] || 'vtp.config.js';
configFilePath = path.normalize(process.cwd() + '/' + configFilePath);
var cwdPath = path.dirname(configFilePath);
var config = require(configFilePath);
var workSrcDirectroy = path.normalize(cwdPath + '/' + config.src);
var outPutDirectroy = path.normalize(cwdPath + '/' + config.output);
// console.log(workSrcDirectroy);


var compiling = false;
// One-liner for current directory, ignores .dotfiles
chokidar.watch(workSrcDirectroy, {ignored: /(^|[\/\\])\../}).on('change', (event, currenpath) => {
	// if (!compiling){
	// 	compiling = true;
	// 	new Promise(function (resolve, reject) {
	// 		compileStatic(currenpath,workSrcDirectroy,resolve);
	// 	}).then(new Promise(function (resolve, reject) {
	// 		compileTemplate(resolve)
	// 	}).then(function(){
	// 		compiling = false;
	// 	}));
	// }
	
	// console.log(workSrcDirectroy);


	var files = rread.fileSync(workSrcDirectroy);
	files.forEach(function(item){
		var relativePath = path.relative(workSrcDirectroy, file);
		var extName = path.extname(file).slice(1);
		var moduleName = relativePath.split(".")[0];

		if()
		console.log(relativePath, extName, moduleName);
	})
	
	
	// rd.each(workSrcDirectroy, function (f, s, next) {
	// 	// 每找到一个文件都会调用一次此函数 
	// 	// 参数s是通过 fs.stat() 获取到的文件属性值 
	// 	console.log('file: %s', f);
	// 	// 必须调用next()才能继续 
	// 	next();
	// }, function (err) {
	// 	if (err) throw err;
	// 	// 完成 
	// });

});



//默认就一个template
const templateRegular = /<template>([\s\S]*)<\/template>/;
//可以有多个config
const configRegular = /<script(?:\s*)type(?:\s*)=(?:\s*)(?:"|')config(?:"|')(?:\s*)>([^<]*)<\/script>/g;
//多个script
const scriptRegular = /<script>([^<]*)<\/script>/g;
//多个style
const styleRegular = /<style(?:\s*)((?:scoped)?)(?:\s*)>([^<]*)<\/style>/g;


//require
const scriptRequireRegular = /require\((?:'|")([^(require)]*)(?:'|")\)/g;
const configRequireRegular = /require\((?:'|")([^(require)]*)(?:'|")\)/g;


//js 词法作用域(lexical scope) / 静态作用域(static scope)
// 所以函数内path可以拿到
//
// var foo=1;       
// function static(){                
//     alert(foo);          
// }      
// !function(){             
//     var foo=2;              
//     static();       
// }();
// static的scope在创建时，记录的foo是1
// 如果是动态作用域   会弹出2
// eval 和 with可以产生动态作用域的效果...

//编译静态文件并打包产出
function compileStatic(nowDealpath,workSrcDirectroy,resolve) {
	var realResolve = resolve;

	log(chalk.green(timestamp('YYYY/MM/DD HH:mm:ss')));
	var arr = fs.readdirSync(workSrcDirectroy),
		itemFile;
	shell.mkdir('-p', outPutDirectroy);
	shell.cd(outPutDirectroy);
	var jsPack = '',
		cssPack = '';
	while ( itemFile = arr.pop() ){
		var itemFilePath = path.normalize(workSrcDirectroy + '/' + itemFile);
		compileStaticItem(itemFilePath,function(jsRet, cssRet){
			jsPack = jsPack + jsRet ;
			cssPack = cssPack + cssRet
		});
	}

	jsPack = UglifyJS.minify(jsPack);
	cssPack = new CleanCSS({}).minify(cssPack).styles;

	new Promise(function (resolve, reject) {
		fs.writeFile('pack.js', jsPack.code ,'utf8', function(err){
			if (err) throw err;
			log(chalk.green('%s has been saved!'), 'pack.js');

			resolve();
		});
	}).then(new Promise(function (resolve, reject) {
		fs.writeFile('pack.css', cssPack ,'utf8', function(err){
			if (err) throw err;
			log(chalk.green('%s has been saved!'), 'pack.css');

			resolve();
		});
	}).then(function(){
		realResolve();
	}));

	shell.cd('-');
}


//单个文件
function compileStaticItem(filePath,cb){
	var templateStr = fs.readFileSync(filePath, {encoding:'utf8'});

	var template = style = script = config = '';

	var temp = '';
	var	requireTemp = '';
	var	requireArr = [];

	if(templateRegular.exec(templateStr)){
		template = templateRegular.exec(templateStr)[0];
		template = template.slice(10,-11);
	}

	while(temp = scriptRegular.exec(templateStr)){
		script = script + '\n' + temp[1];
		while( requireTemp = scriptRequireRegular.exec(temp[1]) ){
			requireArr.push(requireTemp[1]);
		}

	}

	while(temp = configRegular.exec(templateStr)){
		config = config + '\n' + temp[1];
		while( requireTemp = configRequireRegular.exec(temp[1]) ){
			requireArr.push(requireTemp[1]);
		}
	}


	while(temp = styleRegular.exec(templateStr)){
		style = style + '\n' + temp[2];
	}
	var obj = {};


	obj.requireArr = requireArr.map(function(item){
		return JSON.stringify(item);
	}).toString();

	obj.render = beautify(vueCompiler.compile(template).render, { indent_size: 4 });
	obj.staticRenderFns = beautify(vueCompiler.compile(template).staticRenderFns, { indent_size: 4 });
	obj.script = script;
	obj.config = config;

	//先不考虑嵌套的情况了...
	obj.moduleName = path.basename(filePath,'.tpl');

	obj.scopeId = "vue-" + uuidV1();
	var loaderTpl = fs.readFileSync(path.join(__dirname, './template.tpl'), {encoding:'utf8'}); 
	var jsRet = ejs.render(loaderTpl, obj); 

	var writeFileTitle = obj.moduleName + '.js';
	fs.writeFile(writeFileTitle, jsRet ,'utf8', function(err){
		if (err) throw err;
		log(chalk.green('%s has been saved!'), writeFileTitle);
	});
	cb(jsRet, style);
}


function compileTemplate(resolve){
	resolve();
}