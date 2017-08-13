//template= '`string text ${expression} string text`';
//expressions  12--25
//quasis  1--13   26 --38
//'("string text " + expression + " string text")'
//
//'`${expression}`'
//'("" + expression)'

import Parser from './ast/index'
import codeGen from './codegen/index'


export default function (template) {
	var ast = new Parser(template)
	var CodegenResult = codeGen(ast.root)
	CodegenResult.ast = ast
	return CodegenResult
}