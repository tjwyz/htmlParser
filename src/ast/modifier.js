//修饰抽象语法树的方法

/**
 * ast 修饰方法
 */

import parseFilters from './parser/parseFilters'
//根据attrsMap 只修饰attrsList.
//并返回对应值
export function getAndRemoveAttr(el, tagname){
	let val
	if ((val = el.attrsMap[tagname]) != null) {
		const list = el.attrsList
		for (let i = 0, l = list.length; i < l; i++) {
			if (list[i].name === tagname) {
				list.splice(i, 1)
				break
			}
		}
	}
	return val
}
//attrsList  to  attrsMap
export function makeAttrsMap (attrs) {
	const map = {}
	for (let i = 0, l = attrs.length; i < l; i++) {
		map[attrs[i].name] = attrs[i].value
	}
	return map
}
//dynamicValue  / staticValue
//默认先取动态值 再取静态值  找到就立刻return
//第三个参数可以决定只要动态值 没有动态值就算了
export function getBindingAttr (el, name, onlyDynamic) {
	//bindRE
	const dynamicValue =getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name)
	if (dynamicValue != null) {
		return parseFilters(dynamicValue)
	} else if (!onlyDynamic) {
		const staticValue = getAndRemoveAttr(el, name)
		if(staticValue) return JSON.stringify(staticValue)
	}
}
export function addProp (el, name, value) {
	(el.props || (el.props = [])).push({ name, value })
}
export function addAttr (el, name, value) {
	(el.attrs || (el.attrs = [])).push({ name, value })
}
export function addHandler (el, name, value, modifiers, important) {
	// check capture modifier
	if (modifiers && modifiers.capture) {
		delete modifiers.capture
		name = '!' + name // mark the event as captured
	}
	if (modifiers && modifiers.once) {
		delete modifiers.once
		name = '~' + name // mark the event as once
	}
	/* istanbul ignore if */
	if (modifiers && modifiers.passive) {
		delete modifiers.passive
		name = '&' + name // mark the event as passive
	}

	let events
	//区分原生事件与否  最后都是操作events
	if (modifiers && modifiers.native) {
		//为嘛删呢..
		delete modifiers.native
		events = el.nativeEvents || (el.nativeEvents = {})
	} else {
		events = el.events || (el.events = {})
	}

	//value依然没有被JSON.stringify  就是这样很正常..
	//value没办法是字符串  一定要是个变量 代表函数
	
	//es6 Enhanced Object Properties
	const newHandler = { value, modifiers }

	// const handlers = events[name]
	// 写两个/多个v-on的  也不是不可能  绑定个click 再绑定个scroll....先Ban了
	// if (Array.isArray(handlers)) {
	// 	important ? handlers.unshift(newHandler) : handlers.push(newHandler)
	// } else if (handlers) {
	// 	events[name] = important ? [newHandler, handlers] : [handlers, newHandler]
	// } else {
	events[name] = newHandler
	// }
}
export function addDirective (el,name,rawName,value,arg,modifiers) {
	(el.directives || (el.directives = [])).push({ name, rawName, value, arg, modifiers })
}
