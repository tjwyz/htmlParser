import { getAndRemoveAttr } from '../modifier'

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
	//紧靠自己的兄弟if节点
	if (re && re.if) return re
	return undefined
}

export function addIfCondition (el, condition) {
	//el 要插入到那个element中
	if (!el.ifConditions) {
		el.ifConditions = []
	}
	el.ifConditions.push(condition)
}
//处理else/elseif
export function processIfConditions (el, parent) {
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
export function processIf (el) {
	//v-if="ok"
	const exp = getAndRemoveAttr(el, 'v-if')
	if (exp) {
		el.if = exp
		//插到自己上
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
