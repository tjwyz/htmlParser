import { getAndRemoveAttr, getBindingAttr } from '../modifier'
//动态组件
export default function processComponent (el) {
	let binding
	if ((binding = getBindingAttr(el, 'is'))) {
		el.component = binding
	}
	if (getAndRemoveAttr(el, 'inline-template') != null) {
		el.inlineTemplate = true
	}
}