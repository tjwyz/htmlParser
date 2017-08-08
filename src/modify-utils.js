/**
 * ast 修饰方法
 */

import { parseFilters } from './filter-parser'
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
//注意 staticValue 时  JSON.stringify 了一个字符串....
//并返回对应值
export function getBindingAttr (el, name) {
	//bindRE
	const dynamicValue =getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name)
	const staticValue = getAndRemoveAttr(el, name)
	if (dynamicValue != null) {
		return parseFilters(dynamicValue)
	} else if (staticValue != null) {
		return JSON.stringify(staticValue)
	}
}
export function addProp (el, name, value) {
	(el.props || (el.props = [])).push({ name, value })
}
export function addAttr (el, name, value) {
	(el.attrs || (el.attrs = [])).push({ name, value })
}
export function addHandler (el, name, value, modifiers, important, warn) {
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
		delete modifiers.native
		events = el.nativeEvents || (el.nativeEvents = {})
	} else {
		events = el.events || (el.events = {})
	}

	const newHandler = { value, modifiers }
	const handlers = events[name]
	// 还特么连续写两个/多个v-on的？？？
	// 真严谨......
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
