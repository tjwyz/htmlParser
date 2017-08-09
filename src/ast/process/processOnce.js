import { getAndRemoveAttr } from '../modifier'
export default function processOnce (el) {
	const once = getAndRemoveAttr(el, 'v-once')
	if (once != null) {
		el.once = true
	}
}