import { getBindingAttr } from '../modifier'
export default function processSlot (el) {	
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