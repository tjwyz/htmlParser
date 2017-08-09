import parseFilters from '../parser/parseFilters'
import parseModifiers from '../parser/parseModifiers'

import { onRE, bindRE, dirRE, argRE, modifierRE} from '../regular'
import { addProp, addAttr, addHandler, addDirective } from '../modifier'
export default function processAttrs (el) {
	const list = el.attrsList
	let i, l, name, rawName, value, modifiers, isProp
	for (i = 0, l = list.length; i < l; i++) {
		name = rawName = list[i].name
		value = list[i].value
		
		//属性中：
		//1.绑定指令进attrs/props
		//2.事件指令进events/nativeEvents
		//3.自定义的指令进directives
		//4.非指令进attrs  但是非指令属性的value需要被JSON.stringify
		//

		// name  v-bind:tjwyz.emm
		if (dirRE.test(name)) { 
			//attr is a direcative
			//binding值都要经过filter(|)处理
			el.hasBindings = true

			//deal modifier
			//在此之后name就没有"."了
			//返回值是个对象
			// modifiers['prevent'] = true
			// modifiers['ssss'] = true
			modifiers = parseModifiers(name)
			if (modifiers) {
				name = name.replace(modifierRE, '')
			}

			if (bindRE.test(name)) { // v-bind
				// v-bind:tjwyz = 1
				// name == tjwyz
				name = name.replace(bindRE, '')
				value = parseFilters(value)
				isProp = false
				if (modifiers) {
					//尼玛...
					//<div v-bind:text-content.prop="text"></div>
					// if (modifiers.prop) {
					// 	isProp = true
					// 	name = camelize(name)
					// 	if (name === 'innerHtml') name = 'innerHTML'
					// }
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
				

				//这里的value可没被JSON.stringify
				addAttr(el, name, value)
				
				// }
			} else if (onRE.test(name)) { // v-on
				// v-on:tjwyz = 1
				// name == tjwyz
				name = name.replace(onRE, '')
				//最后一个参数false先保留着 暂时没明白  和model有关
				addHandler(el, name, value, modifiers, false)
			} else { // normal directives
				//v-lx:tjwyz=1
				
				//name == lx:tjwyz
				name = name.replace(dirRE, '')
				
				//arg == tjwyz
				const argMatch = name.match(argRE)
				const arg = argMatch && argMatch[1]

				if (arg) {
					//name == lx
					name = name.slice(0, -(arg.length + 1))
				}

				//name == lx
				//arg == tjwyz
				//value == 1
				//modifiers == prevent
				//rawName == v-lx:tjwyz.prevent
				addDirective(el, name, rawName, value, arg, modifiers)
			}
		} else { //text

			//warn instead of <div id="{{ val }}">, use <div :id="val">

			//不是binding值都需要JSON.stringify
			//!!JSON.stringify
			addAttr(el, name, JSON.stringify(value))
		}
	}
}