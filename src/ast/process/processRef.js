import { getBindingAttr } from '../modifier'
// <child-comp ref="child"></child-comp>
// ref静态值  也就是个别名
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
export default function processRef (el) {
	const ref = getBindingAttr(el, 'ref')
	if (ref) {
		el.ref = ref
		el.refInFor = checkInFor(el)
	}
}
