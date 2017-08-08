let stack = []
let root
let currentParent

//onEvent regular
export const onRE = /^@|^v-on:/
//binding regular
export const bindRE = /^:|^v-bind:/
//direcative regular
export const dirRE = /^v-|^@|^:/

export const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/
//item in items  (item, index) of items   (value, key, index) in object
export const forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/

const argRE = /:(.*)$/

//修饰符 (Modifiers) 是以半角句号 . 指明的特殊后缀，用于指出一个指令应该以特殊方式绑定。
//例如，.prevent 修饰符告诉 v-on 指令对于触发的事件调用 event.preventDefault()：
const modifierRE = /\.[^.]+/g


import {getAndRemoveAttr, makeAttrsMap, getBindingAttr, addProp, addAttr, addHandler, addDirective} from './modify-utils'

import {parseText} from './text-parser'

import {transforms} from './basecompiler/modules/index'
// 指令
function processFor (el) {
	//v-for="tab in tabs"
	let exp
	if ((exp = getAndRemoveAttr(el, 'v-for'))) {
		// exp == "tab in tabs"
		const inMatch = exp.match(forAliasRE)
		//tabs
		el.for = inMatch[2].trim()
		//tab (item, index) (value, key, index)
		const alias = inMatch[1].trim()
		const iteratorMatch = alias.match(forIteratorRE)

		if (iteratorMatch) {
			//tab
			el.alias = iteratorMatch[1].trim()
			//item
			el.iterator1 = iteratorMatch[2].trim()
			if (iteratorMatch[3]) {
				el.iterator2 = iteratorMatch[3].trim()
			}
		} else {
			el.alias = alias
		}
	}
	//element.for == tabs
	//element.alias == tab
}
function processIf (el) {
	//v-if="ok"
	const exp = getAndRemoveAttr(el, 'v-if')
	if (exp) {
		el.if = exp
		addIfCondition(el, {
			exp: exp,
			block: el
		})
	} else {
		if (getAndRemoveAttr(el, 'v-else') != null) {
			el.else = true
		}
		const elseif = getAndRemoveAttr(el, 'v-else-if')
		if (elseif) {
			el.elseif = elseif
		}
	}
}
function findPrevIfElement (children) {
	let i = children.length
	let re
	//从下往上数  就近选tag
	while (i--) {
		if (children[i].type === 1) {
			re = children[i]
		} else {
			//`text "${children[i].text.trim()}" between v-if and v-else(-if) will be ignored.`
			children.pop()
		}
	}
	if (re && re.if) return re
	return undefined
}

function addIfCondition (el, condition) {
	if (!el.ifConditions) {
		el.ifConditions = []
	}
	el.ifConditions.push(condition)
}
function processIfConditions (el, parent) {
	//就近找上一个兄弟if tag
	//如果上一个tag不是if  则...应该报错
	const prev = findPrevIfElement(parent.children)
	if (prev) {
		addIfCondition(prev, {
			exp: el.elseif,
			block: el
		})
	} else {
		//without corresponding v-if.`
	}
}


function processOnce (el) {
	const once = getAndRemoveAttr(el, 'v-once')
	if (once != null) {
		el.once = true
	}
}

// 特殊特性
// 

// key为了提高虚拟dom数组遍历时的效率
// <li v-for="item in items" :key="item.id">...</li>
// key动态值
function processKey (el) {
	const exp = getBindingAttr(el, 'key')
	if (exp) {
		el.key = exp
	}
}
// <child-comp ref="child"></child-comp>
// ref静态值  也就是个别名
function processRef (el) {
	const ref = getBindingAttr(el, 'ref')
	if (ref) {
		el.ref = ref
		el.refInFor = checkInFor(el)
	}
}
function checkInFor (el) {
	let parent = el
	while (parent) {
		if (parent.for !== undefined) {
			return true
		}
		parent = parent.parent
	}
	return false
}

function processSlot (el) {	
	//<slot name="footer"></slot>
	//先ban了作用域插槽
	if (el.tag === 'slot') {
		el.slotName = getBindingAttr(el, 'name')
		// } else {
		// 	let slotScope

		// 	if (el.tag === 'template') {
		// 		slotScope = getAndRemoveAttr(el, 'scope')
		// 		el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
		// 	} else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
		// 		el.slotScope = slotScope
		// 	}
		// 	const slotTarget = getBindingAttr(el, 'slot')
		// 	if (slotTarget) {
		// 		el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
		// 		// preserve slot as an attribute for native shadow DOM compat
		// 		// only for non-scoped slots.
		// 		if (el.tag !== 'template' && !el.slotScope) {
		// 			addAttr(el, 'slot', slotTarget)
		// 		}
		// 	}
	}
}
//动态组件
function processComponent (el) {
	let binding
	if ((binding = getBindingAttr(el, 'is'))) {
		el.component = binding
	}
	if (getAndRemoveAttr(el, 'inline-template') != null) {
		el.inlineTemplate = true
	}
}

function parseModifiers (name) {
	// modifierRE  = /\.[^.]+/g
	// /g 全局匹配
	// '@submit.prevent.ssss'.match(modifierRE)
	// ['prevent','ssss']
	const match = name.match(modifierRE)
	//match == ['.prevent']
	if (match) {
		const ret = {}
		match.forEach(m => { ret[m.slice(1)] = true })
		//ret['prevent'] = true
		//ret['ssss'] = true
		return ret
	}
}


function processAttrs (el) {
	const list = el.attrsList
	let i, l, name, rawName, value, modifiers, isProp
	for (i = 0, l = list.length; i < l; i++) {
		name = rawName = list[i].name
		value = list[i].value
		
		if (dirRE.test(name)) { //direcative
			//  element is direcative
			el.isDirecative = true
			// modifiers
			modifiers = parseModifiers(name)
			if (modifiers) {
				// '@submit.prevent.ssss' ==> '@submit'
				name = name.replace(modifierRE, '')
			}

			if (bindRE.test(name)) { // v-bind
				name = name.replace(bindRE, '')
				value = parseFilters(value)
				isProp = false
				if (modifiers) {
					//尼玛...
					//<div v-bind:text-content.prop="text"></div>
					if (modifiers.prop) {
						isProp = true
						name = camelize(name)
						if (name === 'innerHtml') name = 'innerHTML'
					}
					// if (modifiers.camel) {
					// 	name = camelize(name)
					// }
					// if (modifiers.sync) {
					// 	addHandler(
					// 	el,
					// 	`update:${camelize(name)}`,
					// 	genAssignmentCode(value, `$event`)
					// 	)
					// }
				}
				//暂时ban了
				// if (!el.component && (isProp || platformMustUseProp(el.tag, el.attrsMap.type, name))) {
				// 	addProp(el, name, value)
				// } else {
					addAttr(el, name, value)
				// }
			} else if (onRE.test(name)) { // v-on
				name = name.replace(onRE, '')
				addHandler(el, name, value, modifiers, false, warn)
			} else { // normal directives
				//v-lx:tjwyz=1
				name = name.replace(dirRE, '')
				//:tjwyz=1
				const argMatch = name.match(argRE)
				//arg == tjwyz
				const arg = argMatch && argMatch[1]
				if (arg) {
					//name == v-lx
					name = name.slice(0, -(arg.length + 1))
				}
				//value == 1
				addDirective(el, name, rawName, value, arg, modifiers)
			}
		} else { //text
			// literal attribute
			const expression = parseText(value, delimiters)

			if (expression) {
				//warn instead of <div id="{{ val }}">, use <div :id="val">
			}
			//!!JSON.stringify
			addAttr(el, name, JSON.stringify(value))
		}
	}
}



let init = () => {
	stack = []
}
let tagPush = (tag, attrs, unary) => {

	let element = {
		type: 1,
		tag,
		attrsList: attrs,
		attrsMap: makeAttrsMap(attrs),
		currentParent,
		children: []
	}

	// structural directives
	// 改变dom的指令
	processFor(element)
	processIf(element)
	processOnce(element)
	// element-scope stuff
	// 特殊特性
	processKey(element)

	// determine whether this is a plain element after
	// removing structural attributes
	element.plain = !element.key && !element.attrsList.length

	processRef(element)
	processSlot(element)
	processComponent(element)

	for (let i = 0; i < transforms.length; i++) {
		element = transforms[i](element, options) || element
	}
	processAttrs(element)


	// tree management
	if (!root) {
		root = element
	} else if (!stack.length) {
		//永远进不去呢....
		// allow root elements with v-if, v-else-if and v-else
		if (root.if && (element.elseif || element.else)) {
			addIfCondition(root, {
				exp: element.elseif,
				block: element
			})
		}
	}

	//为当前parent添加children
	if (currentParent && !element.forbidden) {
		//if 回正常进入parent.children   而else/elseif进的是上一个兄弟if的ifConditions
		if (element.elseif || element.else) {
			processIfConditions(element, currentParent)
		} else if (element.slotScope) { // scoped slot
		  currentParent.plain = false
		  const name = element.slotTarget || '"default"'
		  ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
		} else {
			currentParent.children.push(element)
			element.parent = currentParent
		}
	}
	//成为parent
	if (!unary) {
		currentParent = element
		//历史记录
		stack.push(element)
	}
}
let tagPop = (tag, start, end) => {
	// remove trailing whitespace
	const element = stack[stack.length - 1]
	const lastNode = element.children[element.children.length - 1]
	//当前一个标签要闭合的时候 可能有trailing whitespace
	//如果有则去掉
	if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
		element.children.pop()
	}
	// pop stack
	stack.length -= 1
	currentParent = stack[stack.length - 1]
}
let chars = (text) => {
	if (!currentParent) {
		return
	}

	const children = currentParent.children
	text = text.trim()
	// vue里可能存在text分两段chars的情况？
	// ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
	// // only preserve whitespace if its not right after a starting tag
	// : preserveWhitespace && children.length ? ' ' : ''
	if (text) {
		let res
		//delimiters值修改文案默认分隔符
		//["{{", "}}"] 默认值
		
		//{{}}
		if (text !== ' ' && (res = parseText(text, delimiters))) {
			children.push({
				type: 2,
				expression: res.expression,
				tokens: res.tokens,
				text
			})
		//plaintext
		} else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {

			children.push({
				type: 3,
				text
			})
		}
	}
}
let comment = (text) => {
	currentParent.children.push({
		type: 3,
		text,
		isComment: true
	})
}
export {init, tagPush, tagPop, chars, comment}