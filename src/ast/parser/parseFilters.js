//！两种case使用filter : bind值 与text值

//<!-- 在双花括号中 -->
//{{ message | capitalize }}

//<!-- 在 `v-bind` 中 -->
//<div v-bind:id="rawId | formatId"></div>

const validDivisionCharRE = /[\w).+\-_$\]]/

//xx|auto  "_f("auto")(xx)"

function wrapFilter (exp, filter) {
	const i = filter.indexOf('(')
	if (i < 0) {
		// _f: resolveFilter
		
		//{{ message | filterA | filterB }}
		//exp == message
		//filter = filterA
		return `_f("${filter}")(${exp})`
	} else {
		//{{ message | filterA('arg1', arg2) }}
		const name = filter.slice(0, i)
		const args = filter.slice(i + 1)
		//觉得缺个parenR..
		return `_f("${name}")(${exp},${args}`
	}
}
export default function parseFilters (exp) {

	let inSingle = false
	let inDouble = false
	let inTemplateString = false
	let inRegex = false
	let curly = 0
	let square = 0
	let paren = 0

	let lastFilterIndex = 0
	let c, prev, i, expression, filters


	//正常一段exp 比如{{tjwyz}} 要等到循环结束
	for (i = 0; i < exp.length; i++) {
		prev = c
		//我不知道charCodeAt写成八进制好在哪....
		c = exp.charCodeAt(i)
		if (inSingle) {
			//ascii 39单引号 并且前一个不是转移\  类推
			if (c === 39 && prev !== 92) inSingle = false
		} else if (inDouble) {
			//34双引号
			if (c === 34 && prev !== 92) inDouble = false
		} else if (inTemplateString) {
			//96 es6的`
			if (c === 96 && prev !== 92) inTemplateString = false
		} else if (inRegex) {
			//47 \
			if (c === 47 && prev !== 92) inRegex = false
		} else if (
			// pipe |
			// 不是||  并且不在({[]})里
			c === 124 && exp.charCodeAt(i + 1) !== 124 &&exp.charCodeAt(i - 1) !== 124 && !curly && !square && !paren
		) {
			if (expression === undefined) {
				// first filter, end of expression
				lastFilterIndex = i + 1
				expression = exp.slice(0, i).trim()
				//继续循环  expresson已经摘出来了
			} else {
				//预见了一个新的管道  把"上一个"管道内容push进去
				//最新的内容始终没push
				pushFilter()
			}
		} else {
			// switch (c) {
			// 	case 34: inDouble = true; break         // "
			// 	case 39: inSingle = true; break         // '
			// 	case 96: inTemplateString = true; break // `
			// 	case 40: paren++; break                 // (
			// 	case 41: paren--; break                 // )
			// 	case 91: square++; break                // [
			// 	case 93: square--; break                // ]
			// 	case 123: curly++; break                 // {
			// 	case 125: curly--; break                 // }
			// }
			// if (c === 47) { // /
			// 	let j = i - 1
			// 	let p
			// 	// find first non-whitespace prev char
			// 	for (; j >= 0; j--) {
			// 		p = exp.charAt(j)
			// 		if (p !== ' ') break
			// 	}
			// 	if (!p || !validDivisionCharRE.test(p)) {
			// 		inRegex = true
			// 	}
			// }
		}
	}

	if (expression === undefined) {
		//一段没有filter的正常文案
		expression = exp.slice(0, i).trim()
	} else if (lastFilterIndex !== 0) {
		//把最新的filter内容push进去
		pushFilter()
	}

	function pushFilter () {
		//lastFilterIndex 是上一个|后的首字母  i对应的位置是 新的|
		//slice方法吃前不吃后
		(filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
		lastFilterIndex = i + 1
	}

	if (filters) {
		for (i = 0; i < filters.length; i++) {
			//递归 上一个函数的结果作为参数传入新的filter(即函数)
			expression = wrapFilter(expression, filters[i])
		}
	}

	return expression
}
