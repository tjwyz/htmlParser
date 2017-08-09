import { getBindingAttr } from '../modifier'
// key为了提高虚拟dom数组遍历时的效率
// <li v-for="item in items" :key="item.id">...</li>
// key动态值

export default function processKey (el) {
	const exp = getBindingAttr(el, 'key')
	if (exp) {
		el.key = exp
	}
}