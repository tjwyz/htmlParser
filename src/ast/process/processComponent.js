import { getAndRemoveAttr, getBindingAttr } from '../modifier'

export default function processComponent (el) {
	let binding
	// 动态组件
	// <component v-bind:is="currentView"></component>
	// 渲染一个“元组件”为动态组件。依 is 的值，来决定哪个组件被渲染。
	// el.component == "currentView"
	// 
	// 
	// 静态
	// <tr is="my-row"></tr>
	// necessary because `<my-row>` would be invalid inside
	// el.component == '"my-row"'
	if ((binding = getBindingAttr(el, 'is'))) {
		el.component = binding
	}
	
	if (getAndRemoveAttr(el, 'inline-template') != null) {
		el.inlineTemplate = true
	}
}