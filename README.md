# vtp

[![npm](https://img.shields.io/npm/v/vtp.svg)](https://www.npmjs.com/package/vtp)

yet another vue template parser (compiler).

base on vue-template-compiler@2.4.0


## Usage
You can compiler vue template in your web browser, or use it as a node library even on the command-line using node.js 


###use vtp as a node library

```
$ [sudo] npm install  vtp

var vtp = require(vtp);
var compiledResult = vtp(template);
```

compiledResult
```
{
    "render":'', //渲染函数
    "staticRenderFns":[] //静态渲染部分
}
```

###use vtp as a command-line

```
$ [sudo] npm install  vtp -g

vtp -c 01.tpl
```
These are the command-line flags for JS scripts
```
CLI Options:
	'-c, --compile', 'just compile it'
	'-d, --diff', 'get the difference from vueCompiler@2.4.0'
```
